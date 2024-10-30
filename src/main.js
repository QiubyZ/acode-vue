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
    // Ditambahkan: getter settings
    if (!window.acode) return this.defaultSettings;
    const AppSettings = acode.require("settings");
    let value = AppSettings.value[plugin.id];
    if (!value) {
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
        configuration: { ignore: ["E501", "E401", "F401", "F704"] },
        pylsp: {
          configurationSources: ["pycodestyle"],
          plugins: {
            pycodestyle: {
              enabled: true,
              ignore: ["E501"],
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

  get settingsObject() {
    const AppSettings = acode.require("settings");
    return {
      list: [
        {
          key: "serverPath",
          text: "Path to Python Language Server",
          prompt: "Path to Server",
          promptType: "text",
          value: this.settings.serverPath,
        },
        {
          key: "arguments",
          text: "Arguments for language server",
          prompt: "Arguments (comma-separated)",
          promptType: "text",
          value: this.settings.arguments.join(", "),
        },
        {
          key: "languageClientConfig",
          text: "Language Client Configuration",
          prompt: "Configuration (JSON string)",
          promptType: "text",
          value: JSON.stringify(this.settings.languageClientConfig, null, 2),
        },
      ],
      cb: (key, value) => {
        switch (key) {
          case "serverPath":
            value = value ? "pylsp" : value;
          case "arguments":
            value = value ? [] : value.split(",").map((item) => item.trim());
            break;
          case "languageClientConfig":
            try {
              //value = JSON.parse(value);
              value = value
                ? JSON.parse(value)
                : this.languageClientConfigDefault;
            } catch (e) {
              console.error("Invalid JSON for languageClientConfig:", e);
              value = this.languageClientConfigDefault;
            }
            break;
        }
        AppSettings.value[plugin.id][key] = value;
        AppSettings.update();
        if (this.acodeLanguageClient) {
          this.setupLanguageClient(this.acodeLanguageClient);
        }
      },
    };
  }
  get languageClientConfigDefault() {
    return {
      configuration: { ignore: ["E501", "E401", "F401", "F704"] },
      pylsp: {
        configurationSources: ["pycodestyle"],
        plugins: {
          pycodestyle: {
            enabled: true,
            ignore: ["E501"],
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
    };
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
      pythonClient,
      this.languageClientConfigDefault,
    );
    acode.registerFormatter("Python Language Client", ["py"], () =>
      acodeLanguageClient.format(),
    );
  }

  async destroy() {}
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
