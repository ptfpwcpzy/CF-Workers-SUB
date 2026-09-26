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

Clash、sing-box 的完整配置仍由 `SUBAPI` 生成。转换时节点会经过该后端。
