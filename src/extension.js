const vscode = require('vscode');
const axios = require('axios');
const testaustime = require('./testaustime.js')

/**
 * @param {vscode.ExtensionContext} context
 */

function activate(context) {
	const testaus = new testaustime.testaustime(context)
	testaus.TestaustimeActivate()

	let TestaustimeApikey = vscode.commands.registerCommand('testaustime-vscode-js.TestaustimeApikey', async function () {
		let keyInput = await vscode.window.showInputBox({
			placeHolder: 'Place API key here'
		})
		if (keyInput != '' && keyInput != undefined) {
			if (await testaus.validateKey(keyInput)) {
				vscode.window.showInformationMessage('API key set succesfully!');
			} else {
				vscode.window.showErrorMessage('Invalid API key!')
			}
		} 
	});

	context.subscriptions.push(TestaustimeApikey);


	let TestaustimeEndpoint = vscode.commands.registerCommand('testaustime-vscode-js.TestaustimeEndpoint', async function () {
		let endpointInput = await vscode.window.showInputBox({
			placeHolder: 'Place custom endpoint URL here'
		})
		if (endpointInput != '' && endpointInput != undefined) {
			testaus.changeEndpoint(endpointInput)
			vscode.window.showInformationMessage(`Endpoint changed to "${endpointInput}"`);
		} 
	});

	context.subscriptions.push(TestaustimeEndpoint);

	vscode.window.setStatusBarMessage("Testaustime-JS active")
}

function deactivate(context) {
	const testaus = new testaustime.testaustime(context)
	testaus.TestaustimeDeactivate()
}

module.exports = {
	activate,
	deactivate
}
