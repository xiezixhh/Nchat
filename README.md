`socket.io 1.0`:

1. 原用于获取所有socket连接的 `io.sockets.clients` 已被弃用， 改用一个数组存储， 然后`forEach`
2. `response.sendfile()` 而不是 `response.sendFile()`， (node v 0.10.29)