import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import { channels } from "../shared/constants";
const { ipcRenderer } = window;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      appName: "web",
      appVersion: "???",
      fileData: "...",
    };
    if (ipcRenderer) {
      ipcRenderer.send(channels.APP_INFO);
      ipcRenderer.on(channels.APP_INFO, (event, arg) => {
        ipcRenderer.removeAllListeners(channels.APP_INFO);
        const { appName, appVersion } = arg;
        this.setState({ appName, appVersion });
      });

      const readFile = async (path) => {
        try {
          const data = await ipcRenderer.invoke("read-file", path);
          this.setState({ fileData: data });
        } catch (e) {
          this.setState({ fileData: e.toString() });
        }
      };
      readFile("D:\\ElecWS\\BuilderTest\\react-with-electron\\README.md");
    }
  }

  render() {
    const { appName, appVersion, fileData } = this.state;
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            {appName} version {appVersion}
          </p>
        </header>
        <pre style={{ textAlign: "left", whiteSpace: "pre-line" }}>
          {fileData}
        </pre>
      </div>
    );
  }
}

export default App;
