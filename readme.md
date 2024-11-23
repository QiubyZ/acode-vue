# Python Language Server (Custom Jedi)
  Custom Your Python Language Server, This configurate default setting is **jedi-language-server**

  **Please Support Me** 🥺

  <a href="https://trakteer.id/qiubyzhukhi/tip" target="_blank"><img id="wse-buttons-preview" src="https://cdn.trakteer.id/images/embed/trbtn-red-1.png?date=18-11-2023" height="40" style="border:0px;height:40px;" alt="Trakteer Saya"></a>

## Setup Language server
  - If you want uses Jedi Language server
    ```bash
     pip install -U jedi-language-server
    ```
    settings.json
    ```json
        "acode.python.custom": {
        "serverPath": "jedi-language-server",
        "arguments": []
        },
    ```

  - if you want uses Pyright
    ```bash
    pip install pyright
    ```
    settings.json
    ```json
        "acode.python.custom": {
        "serverPath": "python",
        "arguments": [
          "-m","pyright.langserver", "--stdio"
        ]
      },
    ```
    [Pyright Video Preview](https://youtu.be/kIFx0yWQbz0?si=PsNRUjgQXIqwmAKJ)


## Preview Language Server
  **settings.json**
  ![preview](https://raw.githubusercontent.com/QiubyZ/code-python-custom/refs/heads/main/settings.jpg)
  
  **Auto Complete Jedi**
  ![YouTube](https://raw.githubusercontent.com/QiubyZ/acode-python-custom/refs/heads/main/preview.gif)

## Update Info
 - Sertings for Pyright tutorial
 - Settings menu fix 
 - Readme.md
 - Gear Icon for Settings only path & argumen

Jedi Repo: [Jedi](https://github.com/pappasam/jedi-language-server)