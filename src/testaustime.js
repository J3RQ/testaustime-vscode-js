const vscode = require('vscode')
const axios = require('axios')
const os = require('os')

class testaustime {
    config = vscode.Memento;
    constructor (context) {
        this.context = context
        this.config = context.globalState
        this.apikey = this.config.get("apikey", "")
        this.endpoint = this.config.get("endpoint", "https://api.testaustime.fi")
        this.pointer = [0, 0]
    }

    async validateKey(apikey) {
        const config = {
            headers:{
            "Authorization": `Bearer ${apikey}` 
            }
        };
        const validateReq = await axios.get(`${this.endpoint}/users/@me`, config).catch(err => err)
        if (validateReq.status == 200) {
            this.apikey = apikey
            this.config.update("apikey", apikey);
            return true
        } else {
            return false
        }
    }

    changeEndpoint(newEndpoint) {
        this.endpoint = newEndpoint
        this.config.update("endpoint", newEndpoint)
    }
    
    async heartbeat() {
        const editor = vscode.window.activeTextEditor
        const data = {
        "language": editor != undefined && editor.document != undefined && editor.document.languageId ? vscode.window.activeTextEditor.document.languageId : "",
        "hostname": os.hostname(),
        "editor_name": "vscode-JS",
        "project_name": vscode.workspace.name != undefined ? vscode.workspace.name : "No workspace"
        }
        const heartbeat = await axios.post(`${this.endpoint}/activity/update`, data, {
            headers: {
                "Authorization": `Bearer ${this.apikey}`,
            },
        }).catch(err => err);
        if (heartbeat.status == 401) {
            vscode.window.showErrorMessage("Testaustime: Invalid API key!")
        }
    }
    
    async flush() {
        await axios.post(`${this.endpoint}/activity/flush`, "", {
            headers: {
                "Authorization": `Bearer ${this.apikey}`
            }
        }).catch(err => err);
    }
    
    async TestaustimeActivate() {
        if (vscode.window.activeTextEditor != undefined) this.heartbeat()
        this.timer = setInterval(() => {
            if (vscode.window.activeTextEditor != undefined) {
                const pointerpos = vscode.window.activeTextEditor.selection.active
                const pointerArray = [pointerpos['_line'], pointerpos['_character']]
                if (this.pointer[0] != pointerArray[0] || this.pointer[1] != pointerArray[1]) {
                    this.pointer = pointerArray
                    this.heartbeat()
                }
            }
        }, 30000);
    }

    TestaustimeDeactivate() {
        clearInterval(this.interval);
        this.flush();
    }
}

module.exports = {
	testaustime
}