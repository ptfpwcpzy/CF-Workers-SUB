# 那么羡慕你

自用订阅汇聚。把多条节点和订阅合成一个入口，按客户端给出 Clash / sing-box 配置。

作者: 那么羡慕你

## 用法

- 管理页：`https://你的域名/<TOKEN>`
- 自适应：同一条地址，由客户端标识决定格式
- Clash：地址后加 `?clash`
- sing-box：地址后加 `?sb`
- 纯节点列表：地址后加 `?b64`

节点保存在 Cloudflare KV，不写在这个仓库里。

## 变量

| 变量 | 作用 |
|---|---|
| TOKEN | 订阅路径 |
| GUEST | 只读访客路径 |
| KV | 绑定名必须是 `KV`，用来保存节点 |
| SUBAPI | 订阅转换后端 |
| SUBCONFIG | 分流模板地址 |
| SUBNAME | 客户端里显示的订阅名 |

默认后端是仍在更新的 `api.asailor.org`。转换时节点会经过该后端；不想经过别人的服务器，就把变量 `SUBAPI` 改成你自己部署的地址。

默认后端已经能转换 VMess、VLESS Reality、Trojan、Shadowsocks、Hysteria2、TUIC、AnyTLS，以及 Clash 的 VLESS XHTTP。WireGuard 分享链接和 sing-box 不接收的 XHTTP 会在返回前补进配置。WireGuard 写成 `wireguard://私钥@主机:端口?publickey=公钥&address=10.0.0.2/32#名称`，私钥里的 `+`、`/`、`=` 要做 URL 编码。
