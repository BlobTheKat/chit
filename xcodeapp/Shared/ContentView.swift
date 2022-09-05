//
//  ContentView.swift
//  Shared
//
//  Created by Matthew Reiner on 03/08/2022.
//

import SwiftUI
import WebKit

class MsgHandler: NSObject, WKScriptMessageHandler/*WithReply*/{
	var webview: WebView
	init(webview: WebView){self.webview = webview}
	func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage)/* async -> (Any?, String?)*/ {
		let _ = webview.handlers[message.name]?(message.body as AnyObject)
		//return (nil, nil)
	}
}

struct WebView: UIViewRepresentable {
	var handlers: [String: (AnyObject) -> (Any?)]
	func userContentController(userContentController: WKUserContentController, didReceiveScriptMessage message: WKScriptMessage) {// edit: changed fun to func
		if (message.name == "callbackHandler"){
				print("\(message.body)")
		}
	}
	func makeUIView(context: Context) -> WKWebView {
		let contentController = WKUserContentController()
		let h = MsgHandler(webview: self)
		for (k, _) in handlers{
			contentController.add/*ScriptMessageHandler*/(h, contentWorld: .page, name: k)
		}
		let config = WKWebViewConfiguration()
		config.ignoresViewportScaleLimits = false
		config.userContentController = contentController
		return WKWebView(frame: .zero, configuration: config)
	}
func updateUIView(_ view: WKWebView, context: UIViewRepresentableContext<WebView>) {
		let request = URLRequest(url: URL(string: "http://192.168.1.91")!)
		view.load(request)
	}
}
struct ContentView: View {
	@State var isHidden = false
	@State var bgColor = Color.clear
	func handlers() -> [String: (AnyObject) -> (Any?)]{ return [
		"statusbar": { msg in
			guard let msg = msg as? String else { return nil }
			if let col = parseHex(msg){
				bgColor = col
				isHidden = false
			}else{isHidden = true}
			return nil
		}
	]}
	var body: some View {
		WebView(handlers: handlers())
			.background(bgColor)
			.statusBar(hidden: isHidden)
	}
}
struct ContentView_Previews: PreviewProvider {
	static var previews: some View { ContentView() }
}

func parseHex(_ str: String) -> Color?{
	guard str.count > 3 && str[str.startIndex] == "#", var int = Int(str.dropFirst(), radix: 16) else { return nil }
	var r = 0, g = 0, b = 0, a = 255
	if str.count < 6{
		if str.count == 5{
			a = (int & 0xF) * 0x11
			int >>= 4
		}
		b = (int & 0xF) * 0x11; int >>= 4
		g = (int & 0xF) * 0x11; int >>= 4
		r = int * 0x11
	}else if str.count == 7 || str.count == 9{
		if str.count == 9{
			a = int & 0xFF
			int >>= 8
		}
		b = (int & 0xFF); int >>= 8
		g = (int & 0xFF); int >>= 8
		r = int
	}else{return nil}
	return Color(.sRGB, red: Double(r) / 255.0, green: Double(g) / 255.0, blue: Double(b) / 255.0, opacity: Double(a) / 255.0)
}
