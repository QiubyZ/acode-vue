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
      serverPath: "pylsp",
      arguments: ["--check-parent-process"],
      languageClientConfig: {
        configuration: { ignore: ["W292","E501", "E401", "F401", "F704"] },
        pylsp: {
          configurationSources: ["pycodestyle"],
          plugins: {
            pycodestyle: {
              enabled: true,
              ignore: ["E501", "W292"],
              maxLineLength: 10,
            },
            pyflakes: {
              enabled: false, //this.settings.linter === "pyflakes"
            },
            pylint: {
              enabled: false, //this.settings.linter === "pylint"
            },
            pyls_mypy: {
              enabled: false, //this.settings.linter === "mypy"
            },
          },
        },
      },
    };
  }
  toast(t, m){
    acode.alert(t, m, ()=>{});
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
    
    acode.registerFormatter(plugin.name,["py"], () =>
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
