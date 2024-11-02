import plugin from "../plugin.json";
class AcodePlugin {
  async init() {

    let acodeLanguageClient = acode.require("acode-language-client");

    if (acodeLanguageClient) {

      this.setupLanguageClient(acodeLanguageClient);
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
    const AppSettings = acode.require("settings");
    let value = AppSettings.value[plugin.id];
    if (!value) {
      //Menjadikan Method defaultSettings sebagai nilai Default
      value = AppSettings.value[plugin.id] = this.defaultSettings;
      AppSettings.update();

    }
    return value;
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

  toast(t, m) {
    acode.alert(t, m, () => { });
  }

  setupLanguageClient(acodeLanguageClient) {
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
      pythonClient, this.settings.languageClientConfig
    );

    acode.registerFormatter(plugin.name, ["py"], () =>
      acodeLanguageClient.format(),
    );
  }

  async destroy() { }
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
  );
  acode.setPluginUnmount(plugin.id, () => {
    acodePlugin.destroy();
  });
}
