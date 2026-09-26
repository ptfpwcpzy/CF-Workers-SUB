
// 部署完成后在网址后面加上这个，获取自建节点和机场聚合节点，/?token=auto或/auto或

let mytoken = 'auto';
let guestToken = ''; //可以随便取，或者uuid生成，https://1024tools.com/uuid
let BotToken = ''; //可以为空，或者@BotFather中输入/start，/newbot，并关注机器人
let ChatID = ''; //可以为空，或者@userinfobot中获取，/start
let TG = 0; //小白勿动， 开发者专用，1 为推送所有的访问信息，0 为不推送订阅转换后端的访问信息与异常访问
let FileName = '那么羡慕你';
let SUBUpdateTime = 6; //自定义订阅更新时间，单位小时
let total = 99;//TB
let timestamp = 4102329600000;//2099-12-31

//节点链接 + 订阅链接
let MainData = `
https://raw.githubusercontent.com/mfuu/v2ray/master/v2ray
`;

let urls = [];
let subConverter = "api.asailor.org"; //订阅转换后端，可用环境变量 SUBAPI 覆盖
let subConfig = "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_MultiCountry.ini"; //分流模板，官方仓库每日更新，可用环境变量 SUBCONFIG 覆盖
let subProtocol = 'https';

export default {
	async fetch(request, env) {
		const userAgentHeader = request.headers.get('User-Agent');
		const userAgent = userAgentHeader ? userAgentHeader.toLowerCase() : "null";
		const url = new URL(request.url);
		const token = url.searchParams.get('token');
		mytoken = env.TOKEN || mytoken;
		BotToken = env.TGTOKEN || BotToken;
		ChatID = env.TGID || ChatID;
		TG = env.TG || TG;
		subConverter = env.SUBAPI || subConverter;
		if (subConverter.includes("http://")) {
			subConverter = subConverter.split("//")[1];
			subProtocol = 'http';
		} else {
			subConverter = subConverter.split("//")[1] || subConverter;
		}
		subConfig = env.SUBCONFIG || subConfig;
		FileName = env.SUBNAME || FileName;

		const currentDate = new Date();
		currentDate.setHours(0, 0, 0, 0);
		const timeTemp = Math.ceil(currentDate.getTime() / 1000);
		const fakeToken = await MD5MD5(`${mytoken}${timeTemp}`);
		guestToken = env.GUESTTOKEN || env.GUEST || guestToken;
		if (!guestToken) guestToken = await MD5MD5(mytoken);
		const 访客订阅 = guestToken;
		//console.log(`${fakeUserID}\n${fakeHostName}`); // 打印fakeID

		let UD = Math.floor(((timestamp - Date.now()) / timestamp * total * 1099511627776) / 2);
		total = total * 1099511627776;
		let expire = Math.floor(timestamp / 1000);
		SUBUpdateTime = env.SUBUPTIME || SUBUpdateTime;

		if (!([mytoken, fakeToken, 访客订阅].includes(token) || url.pathname == ("/" + mytoken) || url.pathname.includes("/" + mytoken + "?"))) {
			if (TG == 1 && url.pathname !== "/" && url.pathname !== "/favicon.ico") await sendMessage(`#异常访问 ${FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgent}</tg-spoiler>\n域名: ${url.hostname}\n<tg-spoiler>入口: ${url.pathname + url.search}</tg-spoiler>`);
			if (env.URL302) return Response.redirect(env.URL302, 302);
			else if (env.URL) return await proxyURL(env.URL, url);
			else return new Response(await nginx(), {
				status: 200,
				headers: {
					'Content-Type': 'text/html; charset=UTF-8',
				},
			});
		} else {
			if (env.KV) {
				await 迁移地址列表(env, 'LINK.txt');
				if (userAgent.includes('mozilla') && !url.search) {
					await sendMessage(`#编辑订阅 ${FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgentHeader}</tg-spoiler>\n域名: ${url.hostname}\n<tg-spoiler>入口: ${url.pathname + url.search}</tg-spoiler>`);
					return await KV(request, env, 'LINK.txt', 访客订阅);
				} else {
					MainData = await env.KV.get('LINK.txt') || MainData;
				}
			} else {
				MainData = env.LINK || MainData;
				if (env.LINKSUB) urls = await ADD(env.LINKSUB);
			}
			let 重新汇总所有链接 = await ADD(MainData + '\n' + urls.join('\n'));
			let 自建节点 = "";
			let 订阅链接 = "";
			for (let x of 重新汇总所有链接) {
				if (x.toLowerCase().startsWith('http')) {
					订阅链接 += x + '\n';
				} else {
					自建节点 += x + '\n';
				}
			}
			MainData = 自建节点;
			urls = await ADD(订阅链接);
			await sendMessage(`#获取订阅 ${FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgentHeader}</tg-spoiler>\n域名: ${url.hostname}\n<tg-spoiler>入口: ${url.pathname + url.search}</tg-spoiler>`);

			const fromConverter = userAgent.includes('subconverter') || userAgent.includes('cf-workers-sub');
			const has = (name) => url.searchParams.has(name) && !fromConverter;
			const hit = (re) => re.test(userAgent);
			let 订阅格式 = 'base64';
			if (fromConverter || userAgent.includes('null')) {
				订阅格式 = 'base64';
			} else if (has('clash') || hit(/clash|mihomo|flclash|verge|stash/)) {
				订阅格式 = 'clash';
			} else if (has('sb') || has('singbox') || hit(/sing-box|singbox|nekobox|nekoray/)) {
				订阅格式 = 'singbox';
			} else if (has('surge') || userAgent.includes('surge')) {
				订阅格式 = 'surge';
			} else if (has('quanx') || userAgent.includes('quantumult')) {
				订阅格式 = 'quanx';
			} else if (has('loon') || userAgent.includes('loon')) {
				订阅格式 = 'loon';
			}

			let subConverterUrl;
			let 订阅转换URL = `${url.origin}/${await MD5MD5(fakeToken)}?token=${fakeToken}`;
			//console.log(订阅转换URL);
			let req_data = MainData;

			let 追加UA = 'v2rayn';
			if (url.searchParams.has('b64') || url.searchParams.has('base64')) 订阅格式 = 'base64';
			else if (url.searchParams.has('clash')) 追加UA = 'clash';
			else if (url.searchParams.has('singbox')) 追加UA = 'singbox';
			else if (url.searchParams.has('surge')) 追加UA = 'surge';
			else if (url.searchParams.has('quanx')) 追加UA = 'Quantumult%20X';
			else if (url.searchParams.has('loon')) 追加UA = 'Loon';

			const 订阅链接数组 = [...new Set(urls)].filter(item => item?.trim?.()); // 去重
			if (订阅链接数组.length > 0) {
				const 请求订阅响应内容 = await getSUB(订阅链接数组, request, 追加UA, userAgentHeader);
				console.log(请求订阅响应内容);
				req_data += 请求订阅响应内容[0].join('\n');
				订阅转换URL += "|" + 请求订阅响应内容[1];
			}

			if (env.WARP) 订阅转换URL += "|" + (await ADD(env.WARP)).join("|");
			//修复中文错误
			const utf8Encoder = new TextEncoder();
			const encodedData = utf8Encoder.encode(req_data);
			//const text = String.fromCharCode.apply(null, encodedData);
			const utf8Decoder = new TextDecoder();
			const text = utf8Decoder.decode(encodedData);

			//去重
			const uniqueLines = new Set(text.split('\n'));
			const result = [...uniqueLines].join('\n');
			//console.log(result);

			let base64Data;
			try {
				base64Data = btoa(result);
			} catch (e) {
				function encodeBase64(data) {
					const binary = new TextEncoder().encode(data);
					let base64 = '';
					const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

					for (let i = 0; i < binary.length; i += 3) {
						const byte1 = binary[i];
						const byte2 = binary[i + 1] || 0;
						const byte3 = binary[i + 2] || 0;

						base64 += chars[byte1 >> 2];
						base64 += chars[((byte1 & 3) << 4) | (byte2 >> 4)];
						base64 += chars[((byte2 & 15) << 2) | (byte3 >> 6)];
						base64 += chars[byte3 & 63];
					}

					const padding = 3 - (binary.length % 3 || 3);
					return base64.slice(0, base64.length - padding) + '=='.slice(0, padding);
				}

				base64Data = encodeBase64(result)
			}

			if (订阅格式 == 'base64' || token == fakeToken) {
				return new Response(base64Data, {
					headers: {
						"content-type": "text/plain; charset=utf-8",
						"Profile-Update-Interval": `${SUBUpdateTime}`,
						//"Subscription-Userinfo": `upload=${UD}; download=${UD}; total=${total}; expire=${expire}`,
					}
				});
			} else if (订阅格式 == 'clash') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=clash&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
			} else if (订阅格式 == 'singbox') {
				let singboxSource = 订阅转换URL;
				const directNodes = result.split('\n').map(item => item.trim()).filter(item => item && !item.toLowerCase().startsWith('http'));
				if (directNodes.length) {
					const joined = directNodes.join('|');
					if (joined.length < 16000) {
						const extra = 订阅转换URL.includes('|') ? 订阅转换URL.slice(订阅转换URL.indexOf('|') + 1) : '';
						singboxSource = extra ? `${joined}|${extra}` : joined;
					}
				}
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=singbox&url=${encodeURIComponent(singboxSource)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
			} else if (订阅格式 == 'surge') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=surge&ver=4&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
			} else if (订阅格式 == 'quanx') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=quanx&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&udp=true`;
			} else if (订阅格式 == 'loon') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=loon&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false`;
			}
			//console.log(订阅转换URL);
			try {
				const subConverterResponse = await fetch(subConverterUrl, { headers: { 'User-Agent': 订阅格式 == 'singbox' ? 'sing-box/1.12.0' : 'clash.meta/1.19.0' } });

				if (!subConverterResponse.ok) {
					const localOnly = localConfig(订阅格式, result);
					if (localOnly) return new Response(localOnly, { headers: { "content-type": "text/plain; charset=utf-8", "Profile-Update-Interval": `${SUBUpdateTime}` } });
					return new Response('订阅转换失败', { status: 502, headers: { "content-type": "text/plain; charset=utf-8" } });
				}
				let subConverterContent = await subConverterResponse.text();
				if (订阅格式 == 'clash') {
					const listUrl = subConverterUrl.replace('list=false', 'list=true').replace(/&config=[^&]*/, '');
					try {
						const listResponse = await fetch(listUrl, { headers: { 'User-Agent': 'clash.meta/1.19.0' } });
						if (listResponse.ok) subConverterContent = inlineClashNodes(subConverterContent, await listResponse.text());
					} catch (e) {}
					subConverterContent = clashFix(subConverterContent, result);
				} else if (订阅格式 == 'singbox') subConverterContent = singboxFix(subConverterContent, result);
				return new Response(subConverterContent, {
					headers: {
						"Content-Disposition": `attachment; filename*=utf-8''${encodeURIComponent(FileName)}`,
						"content-type": "text/plain; charset=utf-8",
						"Profile-Update-Interval": `${SUBUpdateTime}`,
						//"Subscription-Userinfo": `upload=${UD}; download=${UD}; total=${total}; expire=${expire}`,

					},
				});
			} catch (error) {
				const localOnly = localConfig(订阅格式, result);
				if (localOnly) return new Response(localOnly, { headers: { "content-type": "text/plain; charset=utf-8", "Profile-Update-Interval": `${SUBUpdateTime}` } });
				return new Response('订阅转换失败', { status: 502, headers: { "content-type": "text/plain; charset=utf-8" } });
			}
		}
	}
};

async function ADD(envadd) {
	var addtext = envadd.replace(/[	"'|\r\n]+/g, '\n').replace(/\n+/g, '\n');	// 替换为换行
	//console.log(addtext);
	if (addtext.charAt(0) == '\n') addtext = addtext.slice(1);
	if (addtext.charAt(addtext.length - 1) == '\n') addtext = addtext.slice(0, addtext.length - 1);
	const add = addtext.split('\n');
	//console.log(add);
	return add;
}

async function nginx() {
	const text = `
	<!DOCTYPE html>
	<html>
	<head>
	<title>Welcome to nginx!</title>
	<style>
		body {
			width: 35em;
			margin: 0 auto;
			font-family: Tahoma, Verdana, Arial, sans-serif;
		}
	</style>
	</head>
	<body>
	<h1>Welcome to nginx!</h1>
	<p>If you see this page, the nginx web server is successfully installed and
	working. Further configuration is required.</p>
	
	<p>For online documentation and support please refer to
	<a href="http://nginx.org/">nginx.org</a>.<br/>
	Commercial support is available at
	<a href="http://nginx.com/">nginx.com</a>.</p>
	
	<p><em>Thank you for using nginx.</em></p>
	</body>
	</html>
	`
	return text;
}

async function sendMessage(type, ip, add_data = "") {
	if (BotToken !== '' && ChatID !== '') {
		let msg = "";
		const response = await fetch(`http://ip-api.com/json/${ip}?lang=zh-CN`);
		if (response.status == 200) {
			const ipInfo = await response.json();
			msg = `${type}\nIP: ${ip}\n国家: ${ipInfo.country}\n<tg-spoiler>城市: ${ipInfo.city}\n组织: ${ipInfo.org}\nASN: ${ipInfo.as}\n${add_data}`;
		} else {
			msg = `${type}\nIP: ${ip}\n<tg-spoiler>${add_data}`;
		}

		let url = "https://api.telegram.org/bot" + BotToken + "/sendMessage?chat_id=" + ChatID + "&parse_mode=HTML&text=" + encodeURIComponent(msg);
		return fetch(url, {
			method: 'get',
			headers: {
				'Accept': 'text/html,application/xhtml+xml,application/xml;',
				'Accept-Encoding': 'gzip, deflate, br',
				'User-Agent': 'Mozilla/5.0 Chrome/90.0.4430.72'
			}
		});
	}
}

function base64Decode(str) {
	const bytes = new Uint8Array(atob(str).split('').map(c => c.charCodeAt(0)));
	const decoder = new TextDecoder('utf-8');
	return decoder.decode(bytes);
}

async function MD5MD5(text) {
	const encoder = new TextEncoder();

	const firstPass = await crypto.subtle.digest('MD5', encoder.encode(text));
	const firstPassArray = Array.from(new Uint8Array(firstPass));
	const firstHex = firstPassArray.map(b => b.toString(16).padStart(2, '0')).join('');

	const secondPass = await crypto.subtle.digest('MD5', encoder.encode(firstHex.slice(7, 27)));
	const secondPassArray = Array.from(new Uint8Array(secondPass));
	const secondHex = secondPassArray.map(b => b.toString(16).padStart(2, '0')).join('');

	return secondHex.toLowerCase();
}




function inlineClashNodes(full, listText) {
	if (!full.includes('proxy-providers:')) return full;
	const items = [];
	const names = [];
	for (const line of String(listText || '').split('\n')) {
		const trim = line.trim();
		if (!trim.startsWith('-')) continue;
		items.push('  ' + trim);
		const matched = trim.match(/name:\s*([^,]+)/);
		if (!matched) continue;
		let name = matched[1].trim();
		if ((name.startsWith('"') && name.endsWith('"')) || (name.startsWith("'") && name.endsWith("'"))) name = name.slice(1, -1);
		names.push(name);
	}
	if (!items.length) return full;
	const kept = [];
	let skip = false;
	for (const line of full.split('\n')) {
		if (!skip && line.startsWith('proxy-providers:')) {
			skip = true;
			continue;
		}
		if (skip) {
			if (line && !/^\s/.test(line)) skip = false;
			else continue;
		}
		kept.push(line);
	}
	let text = kept.join('\n');
	const block = 'proxies:\n' + items.join('\n') + '\n';
	if (text.includes('\nproxy-groups:')) text = text.replace('\nproxy-groups:', '\n' + block + 'proxy-groups:');
	else text = block + text;
	const lines = text.split('\n');
	const out = [];
	let group = null;
	const flush = () => {
		if (!group) return;
		const body = group.join('\n');
		const usesProvider = /^\s+use:\s*$/m.test(body) && /Provider_/.test(body);
		if (!usesProvider) {
			out.push(...group);
			group = null;
			return;
		}
		let filter = null;
		const filterLine = body.match(/^\s+filter:\s*(.+)$/m);
		if (filterLine) {
			try { filter = new RegExp(filterLine[1].trim()); } catch (e) { filter = null; }
		}
		const picked = names.filter(name => !filter || filter.test(name));
		const keptGroup = [];
		let skippingUse = false;
		for (const line of group) {
			if (/^\s+use:\s*$/.test(line)) {
				skippingUse = true;
				continue;
			}
			if (skippingUse) {
				if (/^\s+- /.test(line)) continue;
				skippingUse = false;
			}
			if (/^\s+filter:/.test(line)) continue;
			keptGroup.push(line);
		}
		const nameLines = picked.length ? picked.map(name => '      - ' + yamlScalar(name)) : ['      - DIRECT'];
		const index = keptGroup.findIndex(line => /^\s+proxies:\s*$/.test(line));
		if (index >= 0) keptGroup.splice(index + 1, 0, ...nameLines);
		else keptGroup.push('    proxies:', ...nameLines);
		out.push(...keptGroup);
		group = null;
	};
	for (const line of lines) {
		if (line.startsWith('proxy-groups:')) {
			flush();
			out.push(line);
			continue;
		}
		if (/^ {2}- name:/.test(line)) {
			flush();
			group = [line];
			continue;
		}
		if (group && line && !/^\s/.test(line)) {
			flush();
			out.push(line);
			continue;
		}
		if (group) group.push(line);
		else out.push(line);
	}
	flush();
	return out.join('\n');
}

function queryMap(search) {
	const out = {};
	const q = search.startsWith('?') ? search.slice(1) : search;
	if (!q) return out;
	for (const part of q.split('&')) {
		if (!part) continue;
		const i = part.indexOf('=');
		const k = decodeURIComponent(i < 0 ? part : part.slice(0, i)).toLowerCase();
		const v = decodeURIComponent(i < 0 ? '' : part.slice(i + 1));
		out[k] = v;
	}
	return out;
}

function linkName(hash, fallback) {
	let name = '';
	try { name = hash ? decodeURIComponent(hash) : ''; } catch (e) { name = hash || ''; }
	name = name.trim();
	return name || fallback;
}

function yamlScalar(value) {
	const text = String(value);
	if (text === '' || /[:{},&*#?|<>=!%@`"'\\\s\[\]]/.test(text)) {
		return '"' + text.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
	}
	return text;
}

function parseWireguardLink(line) {
	const matched = String(line).trim().match(/^(?:wireguard|wg):\/\/([^@/?#]+)@([^:/?#]+):(\d+)(\?[^#]*)?(?:#(.*))?$/i);
	if (!matched) return null;
	let privateKey = '';
	try { privateKey = decodeURIComponent(matched[1]); } catch (e) { privateKey = matched[1]; }
	const server = matched[2];
	const port = Number(matched[3]);
	const q = queryMap(matched[4] || '');
	if (!privateKey) privateKey = q.private_key || q.privatekey || q.secretkey || q.secret_key || '';
	const publicKey = q.publickey || q.public_key || q.peer_public_key || q.peerpublickey || '';
	if (!privateKey || !publicKey || !server || !port) return null;
	let address = (q.address || q.ip || '10.0.0.2/32').split(',').map(item => item.trim()).filter(Boolean);
	address = address.map(item => item.includes('/') ? item : item + '/32');
	let reserved = null;
	if (q.reserved) {
		const parts = q.reserved.split(',').map(item => Number(item.trim())).filter(item => !Number.isNaN(item));
		if (parts.length === 3) reserved = parts;
	}
	return {
		name: linkName(matched[5] || '', 'wireguard'),
		server,
		port,
		privateKey,
		publicKey,
		address,
		mtu: Number(q.mtu || 1280) || 1280,
		reserved,
		psk: q.presharedkey || q.pre_shared_key || q.psk || ''
	};
}

function parseXhttpLink(line) {
	if (!/^vless:\/\//i.test(line)) return null;
	let url;
	try { url = new URL(line.trim()); } catch (e) { return null; }
	const q = queryMap(url.search);
	const type = (q.type || 'tcp').toLowerCase();
	if (type !== 'xhttp' && type !== 'splithttp') return null;
	const uuid = decodeURIComponent(url.username || '');
	const server = url.hostname;
	const port = Number(url.port || 443);
	if (!uuid || !server || !port) return null;
	const security = (q.security || 'none').toLowerCase();
	const sni = q.sni || q.servername || q.host || server;
	const host = q.host || '';
	const path = q.path || '/';
	const fp = q.fp || q.fingerprint || '';
	const pbk = q.pbk || q.publickey || '';
	const sid = q.sid || q.shortid || q.short_id || '';
	const insecure = q.insecure === '1' || q.allowinsecure === '1';
	const name = linkName(url.hash ? url.hash.slice(1) : '', 'xhttp');
	const tlsOn = security === 'tls' || security === 'reality';
	const outbound = {
		type: 'vless',
		tag: name,
		server,
		server_port: port,
		uuid,
		tls: { enabled: tlsOn, server_name: sni, insecure }
	};
	if (fp) outbound.tls.utls = { enabled: true, fingerprint: fp };
	if (security === 'reality' && pbk) outbound.tls.reality = { enabled: true, public_key: pbk, short_id: sid };
	if (q.flow) outbound.flow = q.flow;
	const transport = { type: 'xhttp', path: path || '/' };
	if (host) transport.host = host;
	if (q.mode) transport.mode = q.mode;
	outbound.transport = transport;
	const opts = [`path: ${yamlScalar(path || '/')}`];
	if (host) opts.push(`host: ${yamlScalar(host)}`);
	if (q.mode) opts.push(`mode: ${yamlScalar(q.mode)}`);
	const clash = [
		`name: ${yamlScalar(name)}`,
		`server: ${yamlScalar(server)}`,
		`port: ${port}`,
		`type: vless`,
		`uuid: ${yamlScalar(uuid)}`,
		`udp: true`,
		`tls: ${tlsOn}`,
		`network: xhttp`,
		`encryption: none`,
		`servername: ${yamlScalar(sni)}`,
		`skip-cert-verify: ${insecure}`,
		`xhttp-opts: {${opts.join(', ')}}`
	];
	if (fp) clash.push(`client-fingerprint: ${yamlScalar(fp)}`);
	if (security === 'reality' && pbk) clash.push(`reality-opts: {public-key: ${yamlScalar(pbk)}, short-id: ${yamlScalar(sid)}}`);
	if (q.flow) clash.push(`flow: ${yamlScalar(q.flow)}`);
	return { singbox: outbound, clash: `{${clash.join(', ')}}`, name, uuid };
}

function collectExtra(raw) {
	const wg = [];
	const xhttp = [];
	for (const line of String(raw || '').split('\n')) {
		const text = line.trim();
		if (!text) continue;
		const wireguard = parseWireguardLink(text);
		if (wireguard) {
			wg.push(wireguard);
			continue;
		}
		const xhttpNode = parseXhttpLink(text);
		if (xhttpNode) xhttp.push(xhttpNode);
	}
	return { wg, xhttp };
}

function onlyLocalNodes(raw) {
	const lines = String(raw || '').split('\n').map(line => line.trim()).filter(Boolean);
	return lines.length > 0 && lines.every(line => parseWireguardLink(line) || parseXhttpLink(line));
}

function wgEndpoint(node) {
	const peer = {
		address: node.server,
		port: node.port,
		public_key: node.publicKey,
		allowed_ips: ['0.0.0.0/0', '::/0']
	};
	if (node.reserved) peer.reserved = node.reserved;
	if (node.psk) peer.pre_shared_key = node.psk;
	return {
		type: 'wireguard',
		tag: node.name,
		private_key: node.privateKey,
		address: node.address,
		mtu: node.mtu,
		peers: [peer]
	};
}

function wgClash(node) {
	const ip = (node.address[0] || '10.0.0.2/32').split('/')[0];
	const parts = [
		`name: ${yamlScalar(node.name)}`,
		`server: ${yamlScalar(node.server)}`,
		`port: ${node.port}`,
		`ip: ${ip}`,
		`private-key: ${yamlScalar(node.privateKey)}`,
		`public-key: ${yamlScalar(node.publicKey)}`,
		`udp: true`,
		`mtu: ${node.mtu}`,
		`remote-dns-resolve: true`,
		`type: wireguard`
	];
	if (node.psk) parts.push(`preshared-key: ${yamlScalar(node.psk)}`);
	if (node.reserved) parts.push(`reserved: [${node.reserved.join(', ')}]`);
	return `{${parts.join(', ')}}`;
}

function addClashGroupNames(content, names) {
	if (!names.length || !content.includes('proxy-groups:')) return content;
	const lines = content.split('\n');
	const out = [];
	let inGroups = false;
	let groupType = '';
	let didSelect = false;
	let didUrltest = false;
	for (const line of lines) {
		if (line.startsWith('proxy-groups:')) inGroups = true;
		else if (inGroups && line && !/^\s/.test(line)) inGroups = false;
		out.push(line);
		if (!inGroups) continue;
		const typeMatch = line.match(/^\s+type:\s*(\S+)/);
		if (typeMatch) groupType = typeMatch[1];
		const want = (groupType === 'select' && !didSelect) || (groupType === 'url-test' && !didUrltest);
		if (want && /^\s+proxies:\s*$/.test(line)) {
			const indent = (line.match(/^\s*/)[0] || '') + '  ';
			for (const name of names) out.push(`${indent}- ${yamlScalar(name)}`);
			if (groupType === 'select') didSelect = true;
			if (groupType === 'url-test') didUrltest = true;
		}
	}
	return out.join('\n');
}

function localConfig(format, raw) {
	if (!onlyLocalNodes(raw)) return '';
	const extra = collectExtra(raw);
	if (format === 'clash') {
		const lines = [
			...extra.xhttp.map(item => '  - ' + item.clash),
			...extra.wg.map(item => '  - ' + wgClash(item))
		];
		const names = [...extra.xhttp.map(item => item.name), ...extra.wg.map(item => item.name)];
		let content = `proxies:\n${lines.join('\n')}\nproxy-groups:\n  - name: 节点选择\n    type: select\n    proxies:\n`;
		return addClashGroupNames(content, names);
	}
	if (format === 'singbox') {
		const cfg = {
			log: { level: 'info' },
			inbounds: [{ type: 'mixed', tag: 'mixed-in', listen: '127.0.0.1', listen_port: 2080 }],
			outbounds: extra.xhttp.map(item => item.singbox),
			endpoints: extra.wg.map(wgEndpoint),
			route: { final: '节点选择' }
		};
		const tags = [...extra.xhttp.map(item => item.name), ...extra.wg.map(item => item.name)];
		cfg.outbounds.push({ type: 'selector', tag: '节点选择', outbounds: tags });
		cfg.outbounds.push({ type: 'direct', tag: 'direct' });
		return JSON.stringify(cfg);
	}
	return '';
}

function singboxFix(content, raw) {
	let cfg;
	try {
		cfg = JSON.parse(content);
	} catch (e) {
		return content;
	}
	const fixRule = (rule) => {
		if (!rule || typeof rule !== 'object' || rule.action) return;
		if (typeof rule.outbound === 'string' || rule.server) rule.action = 'route';
		else if (Array.isArray(rule.outbound)) {
			delete rule.outbound;
			if (rule.server) rule.action = 'route';
		}
	};
	if (cfg.dns && Array.isArray(cfg.dns.rules)) cfg.dns.rules.forEach(fixRule);
	if (cfg.route && Array.isArray(cfg.route.rules)) cfg.route.rules.forEach(fixRule);
	if (Array.isArray(cfg.inbounds)) {
		for (const inbound of cfg.inbounds) {
			if (inbound && inbound.inet4_address && !inbound.address) {
				inbound.address = [inbound.inet4_address];
				delete inbound.inet4_address;
			}
		}
	}
	const extra = collectExtra(raw);
	if (!Array.isArray(cfg.outbounds)) cfg.outbounds = [];
	if (!Array.isArray(cfg.endpoints)) cfg.endpoints = [];
	const tags = new Set();
	for (const item of cfg.outbounds) if (item && item.tag) tags.add(item.tag);
	for (const item of cfg.endpoints) if (item && item.tag) tags.add(item.tag);
	const proxyTags = [];
	const endpointTags = [];
	for (const item of extra.xhttp) {
		if (tags.has(item.name)) continue;
		tags.add(item.name);
		cfg.outbounds.push(item.singbox);
		proxyTags.push(item.name);
	}
	for (const item of extra.wg) {
		if (tags.has(item.name)) continue;
		tags.add(item.name);
		cfg.endpoints.push(wgEndpoint(item));
		endpointTags.push(item.name);
	}
	let didSelect = false;
	let didUrltest = false;
	for (const outbound of cfg.outbounds) {
		if (!outbound || !Array.isArray(outbound.outbounds)) continue;
		if (outbound.type === 'selector' && !didSelect) {
			outbound.outbounds = [...proxyTags, ...endpointTags, ...outbound.outbounds];
			didSelect = true;
		} else if (outbound.type === 'urltest' && !didUrltest) {
			outbound.outbounds = [...proxyTags, ...outbound.outbounds];
			didUrltest = true;
		}
	}
	return JSON.stringify(cfg);
}

function clashFix(content, raw) {
	content = content.split('\n').map(line => {
		if (!line.includes('obfs') && !line.includes('down:') && !line.includes('up:') && !line.includes('fingerprint:') && !line.includes('short-id:')) return line;
		let next = line;
		for (const field of ['down', 'up', 'fingerprint']) {
			next = next.replaceAll(`, ${field}: ""`, '').replaceAll(`, ${field}: ''`, '');
		}
		next = next.replace(/, short-id:\s*(""|'')/g, '');
		const obfs = next.match(/,\s*obfs:\s*([^,}\n]+)/);
		const pass = next.match(/,\s*obfs-password:\s*([^,}\n]+)/);
		const clean = (value) => (value || '').trim().replace(/^['"]|['"]$/g, '').toLowerCase();
		const obfsVal = obfs ? clean(obfs[1]) : '';
		const passVal = pass ? clean(pass[1]) : '';
		const badObfs = !obfs || !obfsVal || ['none', 'null', 'off', 'false'].includes(obfsVal);
		const badPass = !pass || !passVal || ['none', 'null', 'off', 'false'].includes(passVal);
		if (obfs && (badObfs || badPass)) {
			next = next.replace(/,\s*obfs:\s*[^,}\n]+/g, '').replace(/,\s*obfs-password:\s*[^,}\n]+/g, '');
		}
		return next;
	}).join('\n');
	if (content.includes('wireguard') && !content.includes('remote-dns-resolve')) {
		let lines;
		if (content.includes('\r\n')) {
			lines = content.split('\r\n');
		} else {
			lines = content.split('\n');
		}

		let result = "";
		for (let line of lines) {
			if (line.includes('type: wireguard')) {
				const 备改内容 = `, mtu: 1280, udp: true`;
				const 正确内容 = `, mtu: 1280, remote-dns-resolve: true, udp: true`;
				result += line.replace(new RegExp(备改内容, 'g'), 正确内容) + '\n';
			} else {
				result += line + '\n';
			}
		}

		content = result;
	}
	const extra = collectExtra(raw);
	const fresh = extra.wg.filter(item => !content.includes(item.privateKey));
	if (fresh.length) {
		const block = fresh.map(item => '  - ' + wgClash(item)).join('\n');
		if (content.includes('\nproxy-groups:')) content = content.replace('\nproxy-groups:', '\n' + block + '\nproxy-groups:');
		else content += '\nproxies:\n' + block + '\n';
		content = addClashGroupNames(content, fresh.map(item => item.name));
	}
	return content;
}

async function proxyURL(proxyURL, url) {
	const URLs = await ADD(proxyURL);
	const fullURL = URLs[Math.floor(Math.random() * URLs.length)];

	// 解析目标 URL
	let parsedURL = new URL(fullURL);
	console.log(parsedURL);
	// 提取并可能修改 URL 组件
	let URLProtocol = parsedURL.protocol.slice(0, -1) || 'https';
	let URLHostname = parsedURL.hostname;
	let URLPathname = parsedURL.pathname;
	let URLSearch = parsedURL.search;

	// 处理 pathname
	if (URLPathname.charAt(URLPathname.length - 1) == '/') {
		URLPathname = URLPathname.slice(0, -1);
	}
	URLPathname += url.pathname;

	// 构建新的 URL
	let newURL = `${URLProtocol}://${URLHostname}${URLPathname}${URLSearch}`;

	// 反向代理请求
	let response = await fetch(newURL);

	// 创建新的响应
	let newResponse = new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: response.headers
	});

	// 添加自定义头部，包含 URL 信息
	//newResponse.headers.set('X-Proxied-By', 'Cloudflare Worker');
	//newResponse.headers.set('X-Original-URL', fullURL);
	newResponse.headers.set('X-New-URL', newURL);

	return newResponse;
}

async function getSUB(api, request, 追加UA, userAgentHeader) {
	if (!api || api.length === 0) {
		return [];
	} else api = [...new Set(api)]; // 去重
	let newapi = "";
	let 订阅转换URLs = "";
	let 异常订阅 = "";
	const controller = new AbortController(); // 创建一个AbortController实例，用于取消请求
	const timeout = setTimeout(() => {
		controller.abort(); // 2秒后取消所有请求
	}, 2000);

	try {
		// 使用Promise.allSettled等待所有API请求完成，无论成功或失败
		const responses = await Promise.allSettled(api.map(apiUrl => getUrl(request, apiUrl, 追加UA, userAgentHeader).then(response => response.ok ? response.text() : Promise.reject(response))));

		// 遍历所有响应
		const modifiedResponses = responses.map((response, index) => {
			// 检查是否请求成功
			if (response.status === 'rejected') {
				const reason = response.reason;
				if (reason && reason.name === 'AbortError') {
					return {
						status: '超时',
						value: null,
						apiUrl: api[index] // 将原始的apiUrl添加到返回对象中
					};
				}
				console.error(`请求失败: ${api[index]}, 错误信息: ${reason.status} ${reason.statusText}`);
				return {
					status: '请求失败',
					value: null,
					apiUrl: api[index] // 将原始的apiUrl添加到返回对象中
				};
			}
			return {
				status: response.status,
				value: response.value,
				apiUrl: api[index] // 将原始的apiUrl添加到返回对象中
			};
		});

		console.log(modifiedResponses); // 输出修改后的响应数组

		for (const response of modifiedResponses) {
			// 检查响应状态是否为'fulfilled'
			if (response.status === 'fulfilled') {
				const content = await response.value || 'null'; // 获取响应的内容
				if (content.includes('proxies:')) {
					//console.log('Clash订阅: ' + response.apiUrl);
					订阅转换URLs += "|" + response.apiUrl; // Clash 配置
				} else if (content.includes('outbounds"') && content.includes('inbounds"')) {
					//console.log('Singbox订阅: ' + response.apiUrl);
					订阅转换URLs += "|" + response.apiUrl; // Singbox 配置
				} else if (content.includes('://')) {
					//console.log('明文订阅: ' + response.apiUrl);
					newapi += content + '\n'; // 追加内容
				} else if (isValidBase64(content)) {
					//console.log('Base64订阅: ' + response.apiUrl);
					newapi += base64Decode(content) + '\n'; // 解码并追加内容
				} else {
					const 异常订阅LINK = `trojan://invalid@127.0.0.1:8888?security=tls&allowInsecure=1&type=tcp&headerType=none#%E5%BC%82%E5%B8%B8%E8%AE%A2%E9%98%85%20${response.apiUrl.split('://')[1].split('/')[0]}`;
					console.log('异常订阅: ' + 异常订阅LINK);
					异常订阅 += `${异常订阅LINK}\n`;
				}
			}
		}
	} catch (error) {
		console.error(error); // 捕获并输出错误信息
	} finally {
		clearTimeout(timeout); // 清除定时器
	}

	const 订阅内容 = await ADD(newapi + 异常订阅); // 将处理后的内容转换为数组
	// 返回处理后的结果
	return [订阅内容, 订阅转换URLs];
}

async function getUrl(request, targetUrl, 追加UA, userAgentHeader) {
	// 设置自定义 User-Agent
	const newHeaders = new Headers(request.headers);
	newHeaders.set("User-Agent", `v2rayN/6.45 ${追加UA}`);

	// 构建新的请求对象
	const modifiedRequest = new Request(targetUrl, {
		method: request.method,
		headers: newHeaders,
		body: request.method === "GET" ? null : request.body,
		redirect: "follow",
		cf: {
			// 忽略SSL证书验证
			insecureSkipVerify: true,
			// 允许自签名证书
			allowUntrusted: true,
			// 禁用证书验证
			validateCertificate: false
		}
	});

	// 输出请求的详细信息
	console.log(`请求URL: ${targetUrl}`);
	console.log(`请求头: ${JSON.stringify([...newHeaders])}`);
	console.log(`请求方法: ${request.method}`);
	console.log(`请求体: ${request.method === "GET" ? null : request.body}`);

	// 发送请求并返回响应
	return fetch(modifiedRequest);
}

function isValidBase64(str) {
	// 先移除所有空白字符(空格、换行、回车等)
	const cleanStr = str.replace(/\s/g, '');
	const base64Regex = /^[A-Za-z0-9+/=]+$/;
	return base64Regex.test(cleanStr);
}

async function 迁移地址列表(env, txt = 'ADD.txt') {
	const 旧数据 = await env.KV.get(`/${txt}`);
	const 新数据 = await env.KV.get(txt);

	if (旧数据 && !新数据) {
		// 写入新位置
		await env.KV.put(txt, 旧数据);
		// 删除旧数据
		await env.KV.delete(`/${txt}`);
		return true;
	}
	return false;
}

async function KV(request, env, txt = 'ADD.txt', guest) {
	const url = new URL(request.url);
	try {
		// POST请求处理
		if (request.method === "POST") {
			if (!env.KV) return new Response("未绑定KV空间", { status: 400 });
			try {
				const content = await request.text();
				await env.KV.put(txt, content);
				return new Response("保存成功");
			} catch (error) {
				console.error('保存KV时发生错误:', error);
				return new Response("保存失败: " + error.message, { status: 500 });
			}
		}

		// GET请求部分
		let content = '';
		let hasKV = !!env.KV;

		if (hasKV) {
			try {
				content = await env.KV.get(txt) || '';
			} catch (error) {
				console.error('读取KV时发生错误:', error);
				content = '读取数据时发生错误: ' + error.message;
			}
		}

		const html = `
			<!DOCTYPE html>
			<html>
				<head>
					<title>${FileName} 订阅编辑</title>
					<meta charset="utf-8">
					<meta name="viewport" content="width=device-width, initial-scale=1">
					<style>
						body {
							margin: 0;
							padding: 15px; /* 调整padding */
							box-sizing: border-box;
							font-size: 13px; /* 设置全局字体大小 */
						}
						.editor-container {
							width: 100%;
							max-width: 100%;
							margin: 0 auto;
						}
						.editor {
							width: 100%;
							height: 300px; /* 调整高度 */
							margin: 15px 0; /* 调整margin */
							padding: 10px; /* 调整padding */
							box-sizing: border-box;
							border: 1px solid #ccc;
							border-radius: 4px;
							font-size: 13px;
							line-height: 1.5;
							overflow-y: auto;
							resize: none;
						}
						.save-container {
							margin-top: 8px; /* 调整margin */
							display: flex;
							align-items: center;
							gap: 10px; /* 调整gap */
						}
						.save-btn, .back-btn {
							padding: 6px 15px; /* 调整padding */
							color: white;
							border: none;
							border-radius: 4px;
							cursor: pointer;
						}
						.save-btn {
							background: #4CAF50;
						}
						.save-btn:hover {
							background: #45a049;
						}
						.back-btn {
							background: #666;
						}
						.back-btn:hover {
							background: #555;
						}
						.save-status {
							color: #666;
						}
					</style>
					<script src="https://cdn.jsdelivr.net/npm/@keeex/qrcodejs-kx@1.0.2/qrcode.min.js"></script>
				</head>
				<body>
					################################################################<br>
					Subscribe / sub 订阅地址, 点击链接自动 <strong>复制订阅链接</strong> 并 <strong>生成订阅二维码</strong> <br>
					---------------------------------------------------------------<br>
					自适应订阅地址:<br>
					<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?sub','qrcode_0')" style="color:blue;text-decoration:underline;cursor:pointer;">https://${url.hostname}/${mytoken}</a><br>
					<div id="qrcode_0" style="margin: 10px 10px 10px 10px;"></div>
					Base64订阅地址:<br>
					<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?b64','qrcode_1')" style="color:blue;text-decoration:underline;cursor:pointer;">https://${url.hostname}/${mytoken}?b64</a><br>
					<div id="qrcode_1" style="margin: 10px 10px 10px 10px;"></div>
					clash订阅地址:<br>
					<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?clash','qrcode_2')" style="color:blue;text-decoration:underline;cursor:pointer;">https://${url.hostname}/${mytoken}?clash</a><br>
					<div id="qrcode_2" style="margin: 10px 10px 10px 10px;"></div>
					singbox订阅地址:<br>
					<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?sb','qrcode_3')" style="color:blue;text-decoration:underline;cursor:pointer;">https://${url.hostname}/${mytoken}?sb</a><br>
					<div id="qrcode_3" style="margin: 10px 10px 10px 10px;"></div>
					surge订阅地址:<br>
					<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?surge','qrcode_4')" style="color:blue;text-decoration:underline;cursor:pointer;">https://${url.hostname}/${mytoken}?surge</a><br>
					<div id="qrcode_4" style="margin: 10px 10px 10px 10px;"></div>
					loon订阅地址:<br>
					<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?loon','qrcode_5')" style="color:blue;text-decoration:underline;cursor:pointer;">https://${url.hostname}/${mytoken}?loon</a><br>
					<div id="qrcode_5" style="margin: 10px 10px 10px 10px;"></div>
					&nbsp;&nbsp;<strong><a href="javascript:void(0);" id="noticeToggle" onclick="toggleNotice()">查看访客订阅∨</a></strong><br>
					<div id="noticeContent" class="notice-content" style="display: none;">
						---------------------------------------------------------------<br>
						访客订阅只能使用订阅功能，无法查看配置页！<br>
						GUEST（访客订阅TOKEN）: <strong>${guest}</strong><br>
						---------------------------------------------------------------<br>
						自适应订阅地址:<br>
						<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/sub?token=${guest}','guest_0')" style="color:blue;text-decoration:underline;cursor:pointer;">https://${url.hostname}/sub?token=${guest}</a><br>
						<div id="guest_0" style="margin: 10px 10px 10px 10px;"></div>
						Base64订阅地址:<br>
						<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/sub?token=${guest}&b64','guest_1')" style="color:blue;text-decoration:underline;cursor:pointer;">https://${url.hostname}/sub?token=${guest}&b64</a><br>
						<div id="guest_1" style="margin: 10px 10px 10px 10px;"></div>
						clash订阅地址:<br>
						<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/sub?token=${guest}&clash','guest_2')" style="color:blue;text-decoration:underline;cursor:pointer;">https://${url.hostname}/sub?token=${guest}&clash</a><br>
						<div id="guest_2" style="margin: 10px 10px 10px 10px;"></div>
						singbox订阅地址:<br>
						<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/sub?token=${guest}&sb','guest_3')" style="color:blue;text-decoration:underline;cursor:pointer;">https://${url.hostname}/sub?token=${guest}&sb</a><br>
						<div id="guest_3" style="margin: 10px 10px 10px 10px;"></div>
						surge订阅地址:<br>
						<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/sub?token=${guest}&surge','guest_4')" style="color:blue;text-decoration:underline;cursor:pointer;">https://${url.hostname}/sub?token=${guest}&surge</a><br>
						<div id="guest_4" style="margin: 10px 10px 10px 10px;"></div>
						loon订阅地址:<br>
						<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/sub?token=${guest}&loon','guest_5')" style="color:blue;text-decoration:underline;cursor:pointer;">https://${url.hostname}/sub?token=${guest}&loon</a><br>
						<div id="guest_5" style="margin: 10px 10px 10px 10px;"></div>
					</div>
					---------------------------------------------------------------<br>
					################################################################<br>
					订阅转换配置<br>
					---------------------------------------------------------------<br>
					SUBAPI（订阅转换后端）: <strong>${subProtocol}://${subConverter}</strong><br>
					SUBCONFIG（订阅转换配置文件）: <strong>${subConfig}</strong><br>
					---------------------------------------------------------------<br>
					################################################################<br>
					${FileName} 汇聚订阅编辑: 
					<div class="editor-container">
						${hasKV ? `
						<textarea class="editor" 
							placeholder="${decodeURIComponent(atob('JUU0JUI4JTgwJUU4JUExJThDJUU0JUI4JTgwJUU0JUI4JUFBJUU4JThBJTgyJUU3JTgyJUI5JUU2JTg4JTk2JUU4JUFFJUEyJUU5JTk4JTg1JUU5JTkzJUJFJUU2JThFJUE1JTBBdmxlc3MlM0EvLzAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMCU0MDEyNy4wLjAuMSUzQTQ0MyUzRmVuY3J5cHRpb24lM0Rub25lJTI2c2VjdXJpdHklM0R0bHMlMjZ0eXBlJTNEdGNwJTIzZXhhbXBsZSUwQWh0dHBzJTNBLy9leGFtcGxlLmNvbS9zdWI='))}"
							id="content">${content}</textarea>
						<div class="save-container">
							<button class="save-btn" onclick="saveContent(this)">保存</button>
							<span class="save-status" id="saveStatus"></span>
						</div>
						` : '<p>请绑定 <strong>变量名称</strong> 为 <strong>KV</strong> 的KV命名空间</p>'}
					</div>
					<br>
					################################################################<br>
					作者: 那么羡慕你<br>
					<br><br>UA: <strong>${request.headers.get('User-Agent')}</strong>
					<script>
					function copyToClipboard(text, qrcode) {
						navigator.clipboard.writeText(text).then(() => {
							alert('已复制到剪贴板');
						}).catch(err => {
							console.error('复制失败:', err);
						});
						const qrcodeDiv = document.getElementById(qrcode);
						qrcodeDiv.innerHTML = '';
						new QRCode(qrcodeDiv, {
							text: text,
							width: 220, // 调整宽度
							height: 220, // 调整高度
							colorDark: "#000000", // 二维码颜色
							colorLight: "#ffffff", // 背景颜色
							correctLevel: QRCode.CorrectLevel.Q, // 设置纠错级别
							scale: 1 // 调整像素颗粒度
						});
					}
						
					if (document.querySelector('.editor')) {
						let timer;
						const textarea = document.getElementById('content');
						const originalContent = textarea.value;
		
						function goBack() {
							const currentUrl = window.location.href;
							const parentUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/'));
							window.location.href = parentUrl;
						}
		
						function replaceFullwidthColon() {
							const text = textarea.value;
							textarea.value = text.replace(/：/g, ':');
						}
						
						function saveContent(button) {
							try {
								const updateButtonText = (step) => {
									button.textContent = \`保存中: \${step}\`;
								};
								// 检测是否为iOS设备
								const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
								
								// 仅在非iOS设备上执行replaceFullwidthColon
								if (!isIOS) {
									replaceFullwidthColon();
								}
								updateButtonText('开始保存');
								button.disabled = true;

								// 获取textarea内容和原始内容
								const textarea = document.getElementById('content');
								if (!textarea) {
									throw new Error('找不到文本编辑区域');
								}

								updateButtonText('获取内容');
								let newContent;
								let originalContent;
								try {
									newContent = textarea.value || '';
									originalContent = textarea.defaultValue || '';
								} catch (e) {
									console.error('获取内容错误:', e);
									throw new Error('无法获取编辑内容');
								}

								updateButtonText('准备状态更新函数');
								const updateStatus = (message, isError = false) => {
									const statusElem = document.getElementById('saveStatus');
									if (statusElem) {
										statusElem.textContent = message;
										statusElem.style.color = isError ? 'red' : '#666';
									}
								};

								updateButtonText('准备按钮重置函数');
								const resetButton = () => {
									button.textContent = '保存';
									button.disabled = false;
								};

								if (newContent !== originalContent) {
									updateButtonText('发送保存请求');
									fetch(window.location.href, {
										method: 'POST',
										body: newContent,
										headers: {
											'Content-Type': 'text/plain;charset=UTF-8'
										},
										cache: 'no-cache'
									})
									.then(response => {
										updateButtonText('检查响应状态');
										if (!response.ok) {
											throw new Error(\`HTTP error! status: \${response.status}\`);
										}
										updateButtonText('更新保存状态');
										const now = new Date().toLocaleString();
										document.title = \`编辑已保存 \${now}\`;
										updateStatus(\`已保存 \${now}\`);
									})
									.catch(error => {
										updateButtonText('处理错误');
										console.error('Save error:', error);
										updateStatus(\`保存失败: \${error.message}\`, true);
									})
									.finally(() => {
										resetButton();
									});
								} else {
									updateButtonText('检查内容变化');
									updateStatus('内容未变化');
									resetButton();
								}
							} catch (error) {
								console.error('保存过程出错:', error);
								button.textContent = '保存';
								button.disabled = false;
								const statusElem = document.getElementById('saveStatus');
								if (statusElem) {
									statusElem.textContent = \`错误: \${error.message}\`;
									statusElem.style.color = 'red';
								}
							}
						}
		
						textarea.addEventListener('blur', saveContent);
						textarea.addEventListener('input', () => {
							clearTimeout(timer);
							timer = setTimeout(saveContent, 5000);
						});
					}

					function toggleNotice() {
						const noticeContent = document.getElementById('noticeContent');
						const noticeToggle = document.getElementById('noticeToggle');
						if (noticeContent.style.display === 'none' || noticeContent.style.display === '') {
							noticeContent.style.display = 'block';
							noticeToggle.textContent = '隐藏访客订阅∧';
						} else {
							noticeContent.style.display = 'none';
							noticeToggle.textContent = '查看访客订阅∨';
						}
					}
			
					// 初始化 noticeContent 的 display 属性
					document.addEventListener('DOMContentLoaded', () => {
						document.getElementById('noticeContent').style.display = 'none';
					});
					</script>
				</body>
			</html>
		`;

		return new Response(html, {
			headers: { "Content-Type": "text/html;charset=utf-8" }
		});
	} catch (error) {
		console.error('处理请求时发生错误:', error);
		return new Response("服务器错误: " + error.message, {
			status: 500,
			headers: { "Content-Type": "text/plain;charset=utf-8" }
		});
	}
}