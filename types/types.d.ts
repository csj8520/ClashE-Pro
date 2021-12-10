interface JsBridgeAPI {
  /**
   * Register a javascript bridge event handle
   */
  registerHandler: <D, P>(eventName: string, callback: (data: D, responseCallback: (param: P) => void) => void) => void;

  /**
   * Call a native handle
   */
  callHandler: <T, D>(handleName: string, data?: D, responseCallback?: (responseData: T) => void) => void;

  /**
   * Who knows
   */
  disableJavscriptAlertBoxSafetyTimeout: () => void;
}

interface Window {
  WebViewJavascriptBridge: JsBridgeAPI;
  WVJBCallbacks: Function[];
}
