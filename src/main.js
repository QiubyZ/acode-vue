import plugin from "../plugin.json";
let AppSettings = acode.require("settings");
class AcodePlugin {
  constructor() {
    this.name_language_type = "vue"
    this.languageserver = "vls";
    //this.extendsion = ["js", "vue"];
    this.standart_args = ["--stdio"]
  }
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
          info: `Lang Server set to ${this.settings.serverPath}`,
          prompt: "Set Language Server Name",
          text: `${plugin.name} Executable File Path`,
          value: this.settings.serverPath,
        },
        {
          index: 1,
          key: "arguments",
          promptType: "text",
          info: "Tutorial:<br>End with a comma ',' if multi args<br>Example: --stdio, -v, -vv",
          prompt: `set Args`,
          text: `${plugin.name} Argument`,
          value: this.settings.arguments.join(", ")
        },
        {
          index: 2,
          key: "modes",
          promptType: "text",
          info: `set to ${this.settings.modes}`,
          prompt: `Use Modes`,
          text: `${plugin.name} Modes`,
          value: this.settings.modes
        },


      ],

      cb: (key, value) => {
        switch (key) {
          case 'arguments':
            value = value ? value.split(",").map(item => item.trim()) : [];
            break;
        }
        AppSettings.value[plugin.id][key] = value;
        AppSettings.update();
      },
    };
  }

  get defaultSettings() {
    return {
      serverPath: this.languageserver,
      arguments: this.standart_args,
      modes: this.name_language_type,
    };
  }

  async setupLanguageClient(acodeLanguageClient) {
    let socket = acodeLanguageClient.getSocketForCommand(
      this.settings.serverPath,
      this.settings.arguments,
    );
    let LanguageClient = new acodeLanguageClient.LanguageClient({
      type: "socket",
      socket,
    });

    // LanguageClient.sendInitialize(
    //   {
    //     initializationOptions:{
    //       typescript: {
    //         tsdk: "node_modules/typescript/lib"
    //     }
    //     }
    //   }
    //   )

    acodeLanguageClient.registerService(
      this.settings.modes,
      LanguageClient
    );
  }

  async destroy() {
    if (AppSettings.value[plugin.id]) {
      delete AppSettings.value[plugin.id];
      AppSettings.update();
    }
    window.toast(`Delete Configuration of ${plugin.name}`)
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
