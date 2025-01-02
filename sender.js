let connection = null;

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

async function sendMessage()
{
    if (connection)
    {
        try
        {
            let consoleLog = document.getElementById('console-log');
            await connection.invoke("jsonReceived", "test");
            console.log("send message");
        } catch (err)
        {
            console.log("Error sending from SignalR: " + err);
        }
    }
}

// connectボタン押下時に SignalR を開始
document.getElementById("connect-button").addEventListener("click", startSignalR);

// disconnectボタン押下時に SignalR を停止
document.getElementById("disconnect-button").addEventListener("click", stopSignalR);

// connectボタン押下時に SignalR を開始
document.getElementById("send-button").addEventListener("click", sendMessage);