import plugin from "../plugin.json";
let AppSettings = acode.require("settings");
class AcodePlugin {
  async init() {

    let acodeLanguageClient = acode.require("acode-language-client");

    if (acodeLanguageClient) {

      await this.setupLanguageClient(acodeLanguageClient);
    } else {
      window.addEventListener("plugin.install", ({ detail }) => {
        if (detail.name === "acode-language-client") {
          acodeLanguageClient = acode.require("acode-language-client");
          this.setupLanguageClient(acodeLanguageClient);
        }
      });
    }
  }
  get settings() {
    // UPDATE SETTING SAAT RESTART ACODE
    if (!window.acode) return this.defaultSettings;
    let value = AppSettings.value[plugin.id];
    if (!value) {
      //Menjadikan Method defaultSettings sebagai nilai Default
      value = AppSettings.value[plugin.id] = this.defaultSettings;
      AppSettings.update();
    }
    return value;
  }
  get settingsMenuLayout() {
    return {
      list: [
        {
          index: 0,
          key: "serverPath",
          promptType: "text",
          prompt: "Change the serverPath before running.",
          text: "Python Executable File Path",
          value: this.settings.serverPath,
        },
        {
          index: 1,
          key: "arguments",
          promptType: "text",
          info:"For multiple arguments, please use comma ','\r\nExample: --stdio, -v, -vv",
          prompt: "Argument Of Language Server",
          text: "Argument",
          value: this.settings.arguments.join(", ")
        },
      ],

      cb: (key, value) => {
        switch(key){
          case 'arguments':
            value = value.split(",").map(item => item.trim());
            break;
        }
        AppSettings.value[plugin.id][key] = value;
        AppSettings.update();
      },
    };
  }

  get defaultSettings() {
    return {
      serverPath: "jedi-language-server",
      arguments: ["--check-parent-process"],
      languageClientConfig: {
        initializationOptions: {
          codeAction: {
            nameExtractVariable: "jls_extract_var",
            nameExtractFunction: "jls_extract_def"
          },
          completion: {
            disableSnippets: false,
            resolveEagerly: false,
            ignorePatterns: []
          },
          diagnostics: {
            enable: false,
            didOpen: true,
            didChange: true,
            didSave: true
          },
          hover: {
            enable: true,
            disable: {
              class: {
                all: false,
                names: [],
                fullNames: []
              },
              function: {
                all: false,
                names: [],
                fullNames: []
              },
              instance: {
                all: false,
                names: [],
                fullNames: []
              },
              keyword: {
                all: false,
                names: [],
                fullNames: []
              },
              module: {
                all: false,
                names: [],
                fullNames: []
              },
              param: {
                all: false,
                names: [],
                fullNames: []
              },
              path: {
                all: false,
                names: [],
                fullNames: []
              },
              property: {
                all: false,
                names: [],
                fullNames: []
              },
              statement: {
                all: false,
                names: [],
                fullNames: []
              }
            }
          },
          jediSettings: {
            autoImportModules: [],
            caseInsensitiveCompletion: true,
            debug: false
          },
          markupKindPreferred: "markdown",
          workspace: {
            extraPaths: [],
            symbols: {
              ignoreFolders: [
                ".nox",
                ".tox",
                ".venv",
                "__pycache__",
                "venv"
              ],
              maxSymbols: 20
            }
          }
        }
      }
    };
  }

  async setupLanguageClient(acodeLanguageClient) {
    let socket = acodeLanguageClient.getSocketForCommand(
      this.settings.serverPath,
      this.settings.arguments,
    );
    let pythonClient = new acodeLanguageClient.LanguageClient({
      type: "socket",
      socket,
    });

    acodeLanguageClient.registerService(
      "python",
      pythonClient,
      this.settings.languageClientConfig
    );

    acode.registerFormatter(plugin.name, ["py"], () =>
      acodeLanguageClient.format(),
    );
  }

  async destroy() {
    if(AppSettings.value[plugin.id]){
      delete AppSettings.value[plugin.id];
      AppSettings.update();
    }
  }
}

if (window.acode) {

  const acodePlugin = new AcodePlugin();
  acode.setPluginInit(
    plugin.id,
    async (baseUrl, $page, { cacheFileUrl, cacheFile }) => {
      if (!baseUrl.endsWith("/")) {
        baseUrl += "/";
      }
      acodePlugin.baseUrl = baseUrl;
      await acodePlugin.init($page, cacheFile, cacheFileUrl);
    },
    acodePlugin.settingsMenuLayout,
  );

  acode.setPluginUnmount(plugin.id, () => {
    acodePlugin.destroy();
  });

}
