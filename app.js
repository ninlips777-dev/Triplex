const App = require('./app/Express');
const redis = require('redis').createClient({
    path : '../../../../../../var/run/redis/redis.sock'
});
const Roulette = require('./app/Roulette');
      Roulette.init();
const Https = require('./app/Https');
const Io = require('socket.io').listen(Https.createServer().listen(2083));
const FreeKassa = require('./app/FreeKassa');
      FreeKassa.init();
//const WebSocket = require('./app/WebSockets');

redis.subscribe('bets');
redis.subscribe('chat');
redis.subscribe('timer');
redis.subscribe('slider');
redis.subscribe('newGame');
redis.subscribe('message');
redis.subscribe('updateBalance');
redis.subscribe('mateNotify');
redis.subscribe('fishing');
redis.on('message', (channel, message) => {
    Io.sockets.emit(channel, JSON.parse(message));
});

OnlineUsers = [];
OnlineIPS = [];
Io.on('connection', async socket => {

    IssetIP = false;
    for(var i in OnlineIPS) if(OnlineIPS[i] == socket.request.connection.remoteAddress) IssetIP = true;
    if(!IssetIP) OnlineIPS.push(socket.request.connection.remoteAddress);
    Io.sockets.emit('online', OnlineIPS.length);

    IpAdded = await Roulette.addOnline(socket.request.connection.remoteAddress);
    if(IpAdded) console.log('[Online] Новый пользователь добавлен в статистику!');

    socket.on('admin_online', () => {
        socket.emit('admin_online', OnlineUsers);
    });

    socket.on('online', () => {
        socket.emit('online', OnlineIPS.length);
    });

    socket.on('registerUser', user => {
        IssetUser = false;
        for(var i in OnlineUsers) if(OnlineUsers[i].id == user.id) 
        {
            IssetUser = true;
            OnlineUsers[i].connections.push(socket.id);
        }
        if(!IssetUser)
        {
            OnlineUsers.push({
                id : user.id,
                username : user.username,
                avatar : user.avatar,
                connections : [socket.id]
            });
        }

        Io.sockets.emit('admin_online', OnlineUsers);
    }); 

    // time checker
    // setInterval(Roulette.topRewards, 5000);

    socket.on('disconnect', () => {
        for(var i in OnlineUsers) for(var s in OnlineUsers[i].connections) if(OnlineUsers[i].connections[s] == socket.id) OnlineUsers[i].connections[s] = false;
        
        // перебираем пользователей
        UsersList = [];
        for(var i in OnlineUsers)
        {
            ConnectionLength = 0;
            for(var s in OnlineUsers[i].connections) if(OnlineUsers[i].connections[s]) ConnectionLength++;

            if(ConnectionLength > 0) UsersList.push(OnlineUsers[i]);
        }
        OnlineUsers = UsersList;
        Io.sockets.emit('admin_online', OnlineUsers);

        // удаляем ip
        IPSList = [];
        for(var i in OnlineIPS) if(OnlineIPS[i] != socket.request.connection.remoteAddress) IPSList.push(OnlineIPS[i]);
        OnlineIPS = IPSList;

        Io.sockets.emit('online', OnlineIPS.length);
    });

    socket.on('getSlider', (room) => {
        socket.emit('postSlider', Roulette.postSlider(room));
    });
});

const Server = App.listen(3000, function () {
    console.log('[SERVER] Сервер запущен (%s', Server.address().port + ')');
});
module.exports = App;