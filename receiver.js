let connection = null;
const maxLogLines = 100;

function logToConsole(message)
{
    const consoleLog = document.getElementById('console-log');
    const newLog = document.createElement('div');
    const timestamp = new Date().toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3, hour12: false });
    newLog.textContent = `[${timestamp}] ${message}`;
    consoleLog.appendChild(newLog);

    // 行数が最大行数を超えたら最初の行を削除
    while (consoleLog.children.length > maxLogLines)
    {
        consoleLog.removeChild(consoleLog.firstChild);
    }
}

// console.logをフックしてlogToConsoleも呼び出す
(function ()
{
    const originalConsoleLog = console.log;
    console.log = function (message)
    {
        originalConsoleLog.apply(console, arguments);
        logToConsole(message);
    };
})();

async function startSignalR()
{
    const negotiateUrl = document.getElementById("negotiate-url").value;
    try
    {
        // SignalR 接続情報を取得
        const response = await fetch(negotiateUrl, { method: "POST" });
        if (!response.ok)
        {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { url, accessToken } = await response.json();

        // SignalR 接続を構築
        connection = new signalR.HubConnectionBuilder()
            .withUrl(url, { accessTokenFactory: () => accessToken })
            .configureLogging(signalR.LogLevel.Information)
            .build();

        // サーバーから "imageUpdated" イベントをリッスン
        connection.on("imageUpdated", (base64Image) =>
        {
            const imgElement = document.getElementById("real-time-image");
            imgElement.src = `data:image/jpeg;base64,${base64Image}`;
            imgElement.style.display = "block";

            // 画像が表示されたら、console-logの高さを画像の高さに合わせる
            imgElement.onload = () =>
            {
                const imgHeight = imgElement.clientHeight;
                document.getElementById('console-log').style.height = `${imgHeight}px`;
            };
        });

        // サーバーから "jsonReceived" イベントをリッスン
        connection.on("jsonReceived", (jsonData) =>
        {
            console.log("Received JSON data:\n" + JSON.stringify(jsonData, null, "\t"));
        });

        // SignalR 接続を開始
        await connection.start();
        console.log("SignalR connected.");

        // ボタンの表示を切り替え
        document.getElementById("connect-button").style.display = "none";
        document.getElementById("disconnect-button").style.display = "block";
    } catch (err)
    {
        console.log("Error connecting to SignalR: " + err);
    }
}

async function stopSignalR()
{
    if (connection)
    {
        try
        {
            await connection.stop();
            console.log("SignalR disconnected.");

            // ボタンの表示を切り替え
            document.getElementById("connect-button").style.display = "block";
            document.getElementById("disconnect-button").style.display = "none";
        } catch (err)
        {
            console.log("Error disconnecting from SignalR: " + err);
        }
    }
}

// connectボタン押下時に SignalR を開始
document.getElementById("connect-button").addEventListener("click", startSignalR);

// disconnectボタン押下時に SignalR を停止
document.getElementById("disconnect-button").addEventListener("click", stopSignalR);