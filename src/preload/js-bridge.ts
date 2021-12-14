/**
 *  https://github.com/marcuswestin/WebViewJavascriptBridge
 */

export class JsBridgeAPI {
  private _handles = new Map<string, Function[]>();
  public registerHandler(eventName: string, callback: (data: any, responseCallback: (...args: any) => void) => void) {
    const fns = this._handles.get(eventName) || [];
    fns.push(callback);
    this._handles.set(eventName, fns);
  }
  public callHandler(handleName: string, data?: any, responseCallback?: (...args: any) => void) {
    console.log(handleName, data, responseCallback);
    const fns = this._handles.get(handleName) || [];
    fns.forEach(it => it(data, responseCallback));
  }
  public disableJavscriptAlertBoxSafetyTimeout() {}
}
