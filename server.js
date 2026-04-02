const colors = require("colors");
const http = require("http");
const fs = require("fs");
const stat = require("fs/promises").stat;
const path = require("path");
const url = require("url");
const mime = require("mime");
require("@babel/register")({ presets: ["@babel/env", "@babel/react"] });
const React = require("react");
const ReactDOMServer = require("react-dom/server");

let { spawn } = require("child_process");
ob = path.parse(__filename);
fdb = path.join(ob.root, "Волковыск Магазин", "VOLKOVISK_CASH.GDB");

let { IntervalServer, ServerPort, currentBrowser, database } = require(
  path.join(__dirname, "source", "serverinterval.json"),
);

const replaceReservedSymbol = (str) => {
  let regEx = /(?<space>[%\s])|(?<amp>&)|(?<lt><)|(?<gt>>)|(?<apos>')|(?<quote>")/g;
  return str.replace(regEx, (simb, index) => {
    let s = "";
    switch (simb) {
      case "%":
        s = "";
      case " ":
        s = "";
        break;
      case "&":
        s = "&amp;";
        break;
      case "<":
        s = "&lt;";
        break;
      case ">":
        s = "&gt;";
        break;
      case "?":
        s = "&apos;";
        break;
      default:
        s = "&quote;";
    }
    return s;
  });
};
const generateArrayLetter = (arr) => arr.map((code) => String.fromCharCode(code));

const compose =
  (arg) =>
  (...func) =>
    func.reduce((prev, f) => f(prev), arg);

const generater = (fierst = "А", last = "я") => {
  let length = [fierst, last].map((str) => str.codePointAt(0)).reduce((prev, cur) => cur - prev, 0) + 1;
  return () => Array.from({ length }, (value, index) => fierst.codePointAt(0) + index);
};

const rusLetter = [...generateArrayLetter(generater("а", "я")()), ...generateArrayLetter(generater("А", "Я")())];
const engLetter = [...generateArrayLetter(generater("a", "z")()), ...generateArrayLetter(generater("A", "Z")())];

const replaceRushienLetter = (arg) =>
  arg.replace(/[а-яА-Я]/g, (simb, index) => {
    let curIndex = rusLetter.indexOf(simb);
    return engLetter[curIndex > engLetter.length ? engLetter.length - curIndex : curIndex];
  });

//*********************todo перезаписали в папку dist файлы с папок audio, image, css, audio**************************
const fs_promise = fs.promises;

console.clear();

async function start(direct, directOutput) {
  try {
    await fs.exists(directOutput, async (exit) => {
      if (!exit) {
        fs.mkdir(directOutput, { recursive: true }, async (err) => {
          if (err) throw err;
          await readFileInDir(direct, directOutput);
        });
      } else {
        let dirDeleted = await reamovecatalog(directOutput);
        await start(direct, dirDeleted);
      }
    });
  } catch (e) {
    console.log(e);
  }
}

const os = require("os");
const IPv4 =
  Object.entries(os.networkInterfaces())
    .flat(5)
    .filter((e) => e instanceof Object)
    .filter((e) => e.family.match(/^ipv4/i) && !e.internal)
    .map((e) => e.address)[0] || "localhost";

console.log(IPv4);

let server = new http.Server();

async function initPython(file, ...args) {
  //let pythonProcess = spawn("python", [`${path.join("./", "python", "initscreen.py")}`, database]);
  let pythonProcess = spawn("python", [`${path.join("./", "python", file)}`, ...args]);
}

async function StartBAT() {
  stat(path.join(__dirname, "source", "serverinterval.json"))
    .then(() => {
      ServerPort = require(path.join(__dirname, "source", "serverinterval.json")).ServerPort;
    })
    .catch(() => {
      ServerPort = 50001;
    })
    .finally(() => {
      server.listen(ServerPort, IPv4, async () => {
        console.log(`Сервер запущен по адреcу: http://${IPv4}:${ServerPort}`.bgBrightGreen);

        // Запускаем Питон создаем бэкграунд экрана и подтягиваем файлы рекламы
        await initPython("init_screen.py", database);

        //@@@@@@@@@@@@@@@@@@@@@@@@@@@@ организация генератора получения установленных на компе браузеров, первый будет edge
        let Browser = [
          {
            currentBrowser: "Microsoft Edge",
            path: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
            start: `@echo off
            set DesktopPath=%USERPROFILE%\Desktop
            cd %DesktopPath%            
            SET EdgePath="C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
            REM URL сайта для киоска
            SET StartURL="http://${IPv4}:${ServerPort}/"
            REM Запуск в режиме киоска
            start "" %EdgePath% --kiosk %StartURL% --edge-kiosk-type=fullscreen --no-first-run --disable-features=TranslateUI
            exit`,
            createLink: `Set objShell = WScript.CreateObject("WScript.Shell")
              Dim strUserProfile
              strUserProfile = objShell.ExpandEnvironmentStrings("%USERPROFILE%")
              Set lnk = objShell.CreateShortcut(strUserProfile & "/Desktop/CustomDisplay.lnk")
              lnk.TargetPath =  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"  
              lnk.Arguments = "--kiosk http://${IPv4}:${ServerPort} --edge-kiosk-type=fullscreen --no-first-run --disable-features=TranslateUI"               
              lnk.Description = "Shutdown"
              'lnk.HotKey = "ALT+CTRL+F"              
			        lnk.IconLocation = "%SystemRoot%/SystemResources/shell32.dll.mun, 94"
              lnk.WindowStyle = "1"
              lnk.WorkingDirectory = "C:/Program Files (x86)/Microsoft/Edge/Application"
              lnk.Save
              objShell.Run """" & strUserProfile & "/Desktop/CustomDisplay.lnk" & """", 1, False 
              Set lnk = Nothing
              Set objShell = Nothing`,
            alttab: `Set WshShell = WScript.CreateObject("WScript.Shell") 
              WshShell.SendKeys "%{TAB}" 
              Set WshShell = Nothing`,
          },
          {
            currentBrowser: "Google Chrome",
            path: "C:/Program Files/Google/Chrome/Application/chrome.exe",
            start: `@echo off
            SET EdgePath="C:/Program Files/Google/Chrome/Application/chrome.exe"            
            start "" %EdgePath% --user-data-dir=C:/Temp/Supertemp/smth --kiosk --start-fullscreen --disable-features=Translate --app=http://${IPv4}:${ServerPort}
            exit`,
            createLink: `Set objShell = WScript.CreateObject("WScript.Shell")
              Dim strUserProfile
              strUserProfile = objShell.ExpandEnvironmentStrings("%USERPROFILE%")
              Set lnk = objShell.CreateShortcut(strUserProfile & "/Desktop/CustomDisplay.lnk")
              lnk.TargetPath =  "C:/Program Files/Google/Chrome/Application/chrome.exe"  
              lnk.Arguments = "---user-data-dir=C:/Temp/Supertemp/smth -kiosk --start-fullscreen --disable-translate --disable-features=Translate http://${IPv4}:${ServerPort}" 
              lnk.Description = "Shutdown"
              'lnk.HotKey = "ALT+CTRL+F"              
			        lnk.IconLocation = "%SystemRoot%/SystemResources/shell32.dll.mun, 94"
              lnk.WindowStyle = "1"
              lnk.WorkingDirectory = "C:/Program Files/Google/Chrome/Application"
              lnk.Save
              objShell.Run """" & strUserProfile & "/Desktop/CustomDisplay.lnk" & """", 1, False 
              Set lnk = Nothing
              Set objShell = Nothing`,
            alttab: `Set WshShell = WScript.CreateObject("WScript.Shell") 
              WshShell.SendKeys "%{TAB}" 
              Set WshShell = Nothing`,
          },
          {
            currentBrowser: "Google Chrome",
            path: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
            start: `@echo off
            SET EdgePath="C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"
            start "" %EdgePath% --user-data-dir=C:/Temp/Supertemp/smth --kiosk --start-fullscreen --disable-features=Translate --app=http://${IPv4}:${ServerPort}/
            exit`,
            createLink: `Set objShell = WScript.CreateObject("WScript.Shell")
              Dim strUserProfile
              strUserProfile = objShell.ExpandEnvironmentStrings("%USERPROFILE%")
              Set lnk = objShell.CreateShortcut(strUserProfile & "/Desktop/Customer of display.LNK")              
              lnk.TargetPath =  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"  
              lnk.Arguments = "---user-data-dir=C:/Temp/Supertemp/smth -kiosk --start-fullscreen --disable-translate --disable-features=Translate http://${IPv4}:${ServerPort}" 
              lnk.Description = "Shutdown"
              'lnk.HotKey = "ALT+CTRL+F"              
			        lnk.IconLocation = "%SystemRoot%/SystemResources/shell32.dll.mun, 94"
              lnk.WindowStyle = "1"
              lnk.WorkingDirectory = "C:/Program Files (x86)/Google/Chrome/Application"
              lnk.Save
              objShell.Run """" & strUserProfile & "/Desktop/Customer of display.LNK" & """", 1, False 
              Set lnk = Nothing
              Set objShell = Nothing`,
            alttab: `Set WshShell = WScript.CreateObject("WScript.Shell") 
              WshShell.SendKeys "%{TAB}" 
              Set WshShell = Nothing`,
          },
          {
            currentBrowser: "Mozilla Firefox",
            path: "C:/Program Files/Mozilla Firefox/firefox.exe",
            start: `SET EdgePath="C:/Program Files/Mozilla Firefox/firefox.exe"            
            start "" %EdgePath% --user-data-dir=C:/Temp/Supertemp/smth --kiosk --start-fullscreen --disable-features=Translate --app=http://${IPv4}:${ServerPort}/
            exit`,
            createLink: `Set objShell = WScript.CreateObject("WScript.Shell")
              Dim strUserProfile
              strUserProfile = objShell.ExpandEnvironmentStrings("%USERPROFILE%")
              Set lnk = objShell.CreateShortcut(strUserProfile & "/Desktop/Customer of display.LNK")              
              lnk.TargetPath =  "C:/Program Files/Mozilla Firefox/firefox.exe"  
              lnk.Arguments = "---user-data-dir=C:/Temp/Supertemp/smth -kiosk --start-fullscreen --disable-translate --disable-features=Translate http://${IPv4}:${ServerPort}" 
              lnk.Description = "Shutdown"
              'lnk.HotKey = "ALT+CTRL+F"              
			        lnk.IconLocation = "%SystemRoot%/SystemResources/shell32.dll.mun, 94"
              lnk.WindowStyle = "1"
              lnk.WorkingDirectory = "C:/Program Files/Mozilla Firefox"
              lnk.Save
              objShell.Run """" & strUserProfile & "/Desktop/Customer of display.LNK" & """", 1, False 
              Set lnk = Nothing
              Set objShell = Nothing`,
            alttab: `Set WshShell = WScript.CreateObject("WScript.Shell") 
              WshShell.SendKeys "%{TAB}" 
              Set WshShell = Nothing`,
          },
        ];

        Browser = Array.from([
          ...Browser.filter((x) => x.currentBrowser === `${currentBrowser}`),
          ...Browser.filter((x) => x.currentBrowser !== `${currentBrowser}`),
        ]);

        async function* getCommand() {
          for (let { path, start, createLink, alttab } of Browser) {
            console.log("path", path);
            try {
              let Stats = await stat(path);
              yield await Promise.resolve(
                Object.assign({}, { start: `${start}`, createLink: `${createLink}`, alttab: `${alttab}` }),
              );
            } catch (e) {
              yield { start: "no file" };
            }
          }
        }

        for await (let { start, createLink, alttab } of getCommand()) {
          if (!/no file/.test(start)) {
            console.log("start".yellow, start);
            console.log("createLink".yellow, createLink);
            console.log("alttab".yellow, alttab);
            await fs.writeFile(path.join(__dirname, "cmd", "start.bat"), start, cb);
            await fs.writeFile(path.join(__dirname, "cmd", "createLink.vbs"), createLink, cb);
            await fs.writeFile(path.join(__dirname, "cmd", "alttab.vbs"), alttab, cb);
            return;
          }
        }
      });
      //@@@@@@@@@@@@@@@@@@@@@@@@@@@@ END
    });
}

server.on("error", (e) => {
  if (e.code === "EADDRINUSE") {
    console.error("Address in use, retrying...");
    setTimeout(() => {
      server.close();
      process.exit();
      // server.listen(ServerPort, IPv4);
    }, 1000);
  }
});

(function () {
  /* Promise.race(
    ["images"].map((e) => start(path.join(__dirname, e), path.join(__dirname, "dist", e))),
    StartBAT(),
  );
  */
  Promise.race(
    [].map((e) => start(path.join(__dirname, e), path.join(__dirname, "dist", e))),
    StartBAT(),
  );
})();

async function reamovecatalog(dir) {
  try {
    let files = await fs.promises.readdir(dir, { encoding: "utf-8", withFileTypes: true });
    for await (let file of files) {
      let newdir = path.join(dir, file.name);
      if (file.isFile()) {
        fs.promises.unlink(newdir);
      } else await reamovecatalog(newdir);
    }
    await fs.promises.rmdir(dir);
    return dir;
  } catch (error) {
    console.log(error);
  }
}

async function readFileInDir(directSource, directOutput) {
  try {
    const files = await fs_promise.readdir(directSource);
    for await (const file of files) {
      const pathToFile = path.join(directSource, file);
      const itemStats = await fs_promise.stat(pathToFile);
      if (itemStats.isFile()) {
        //console.log(`####создаем файл:#########${path.join(directOutput, file)}`.magenta);
        let output = fs.createReadStream(path.join(directSource, file));
        let input = fs.createWriteStream(
          path.join(directOutput, compose(file)(replaceReservedSymbol, replaceRushienLetter)),
          "utf-8",
        );
        output.pipe(input);
      } else {
        await start(path.join(directSource, file), path.join(directOutput, file));
      }
    }
  } catch (err) {
    console.error(err);
  }
}

async function readFileResponceTo(directSource, streamOutput) {
  try {
    let imgFromData = new FormData();
    const files = await fs_promise.readdir(directSource);
    dataBuffer = [];
    streamOutput.writeHead(200, { "Content-Type": "application/json" });
    for await (const file of files) {
      const pathToFile = path.join(directSource, file);
      const itemStats = await fs_promise.stat(pathToFile);
      if (itemStats.isFile()) {
        //fs.createReadStream(path.join(directSource, file)).pipe(streamOutput);
        dataBuffer.push(path.relative(__dirname, path.join(directSource, file)));
      }
    }
    streamOutput.end(JSON.stringify(dataBuffer));
  } catch (err) {
    console.error(err);
  }
}
//*******************end*****************************/

//todo подключаем компиляцию на ходу из JSX в JS React
//todo для импортирования JSX после установки babel-register и babel-preset-react из npm:
const cb = (err) => {
  console.log(err);
  return err;
};

//создали для рендеринга на стороне сервера React element
const ErrorBundle = function (message) {
  return React.createElement(
    require("./jsx/errorBundle.jsx"),
    { message: message, width: "200px", height: "100px" },
    React.createElement(
      require("./jsx/animationCircle.jsx"),
      {
        width: "500px",
        height: "100px",
        style: { position: "absolute", left: 50, zIndex: "-10000" },
        speed: "1000 / 24",
      },
      null,
    ),
  );
};

async function CreateOrderFolder(folder) {
  try {
    await fs.exists(folder, async (exit) => {
      if (!exit) {
        return fs.mkdir(folder, { recursive: true }, async (err) => {
          if (err) throw err;
          console.log("должен создасться каталог ", folder);
        });
      } else return true;
    });
  } catch (e) {
    console.log("ошибка создания каталдога:", e);
    throw err;
  }
}

server.on("request", (request, response) => {
  let pathname = url.parse(request.url).pathname;
  let menu = require(path.join(__dirname, "source", "menu.json"));
  let basketSale_itog_style = require(path.join(__dirname, "source", "basketSale_itog_style.json"));
  if (request.method === "GET") {
    let filePath = path.join(__dirname, compose(request.url)(replaceRushienLetter, replaceReservedSymbol));
    if (pathname === "/") {
      const streamRead = fs.createReadStream(path.join(__dirname, "dist", "index.html"));
      var dataBuffer = [];
      streamRead.on("data", (chunk) => {
        dataBuffer = dataBuffer.concat(...chunk);
      });
      streamRead.on("error", (err) => {
        let result = Buffer.from(dataBuffer)
          .toString()
          .replace(
            /\<body\>.{1,}\<\/body\>/s,
            `<body>          
          <div id='content'></div>
          <script>
          ReactDOM.render(${ReactDOMServer.renderToString(ErrorBundle())},document.getElementById("content"));
          </script>          
          </body>`,
          );
        if (err.code === "ENOENT") {
          response.writeHead(404, { "content-type": "text/html; chatset=utf-8" });
          response.end(result);
        } else {
          response.statusCode = 500;
          response.end(result);
        }
        console.log(err);
      });
      streamRead.on("end", async () => {
        await response.writeHead(200, { "content-type": "text/html; chatset=utf-8" });
        let styleBkground =
          '<style type="text/css">body{background-image:url(/images/background/background.jpg);background-repeat: no-repeat;background-position: left top;background-attachment: fixed;background-size: cover;}</style>';
        stat(path.join(__dirname, "images", "background", "background.jpg"))
          .catch(() => {
            styleBkground = '<style type="text/css">body{background-image:url(/images/background_main.jpg);}</style>';
          })
          .finally(() => {
            let interval;
            stat(path.join(__dirname, "source", "serverinterval.json"))
              .then((state) => {
                interval = IntervalServer;
              })
              .catch(() => {
                interval = 5000;
              })
              .finally(() => {
                let result = Buffer.from(dataBuffer)
                  .toString()
                  .replace(
                    /<body>/i,
                    `<body>`.concat(styleBkground).concat(`<script> const interval = ${interval};</script>`),
                  );
                console.log(result.bgMagenta);
                response.write(result);
                response.end();
              });
          });
      });
    } else if (pathname === "/animation_img/library") {
      let pathLibreryPict = path.join(__dirname, "dist", "images", "library");
      let res = [];
      fs.readdir(pathLibreryPict, (err, files) => {
        if (err) cb(err);
        for (let file of files) {
          res.push(path.join("dist", "images", "library", file));
        }
        console.log(res.join("\n\t").america);
        response.setHeader("Content-Type", "application/json");
        response.end(JSON.stringify(res));
      });
    } else if (/\/(pre_order|headerpre_order)/.test(pathname)) {
      let { source } = /\/(?<source>.+)/.exec(pathname).groups;
      initPython("check.py", database);
      fs.stat(path.join(__dirname, "source", "pre_order", `${source}.json`), (err, stats) => {
        if (err) {
          response.writeHead(400, { "content-type": "application/text; chatset=utf-8" });
          response.end("empty");
        } else {
          console.log("size".bgYellow, stats.size);
          if (stats.size) {
            let readStream = fs.createReadStream(
              path.join(__dirname, "source", "pre_order", `${source}.json`),
              "utf-8",
            );
            response.writeHead(200, {
              "content-type": mime.getType(path.basename(filePath)),
            });
            readStream.on("data", (chunk) => {
              response.write(chunk);
            });
            readStream.on("end", () => response.end());
          } else {
            response.writeHead(200, {
              "content-type": mime.getType(path.basename(filePath)),
            });

            response.end(JSON.stringify({}));
          }
        }
      });
    } else if (/\/get_structure/.test(pathname)) {
      let arr = menu;
      console.log(arr);
      response.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify(arr));
    } else if (/\/get_reklama/.test(pathname)) {
      let reklama = path.join(__dirname, "images", "reklama");
      readFileResponceTo(reklama, response);
      console.log("reklama".yellow, reklama.yellow);
    } else if (/\/get_basketSale_itog_style/.test(pathname)) {
      console.log("basketSale_itog_style".yellow, basketSale_itog_style.yellow);
      response.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify(basketSale_itog_style));
    } else {
      console.log(filePath.red);
      fs.exists(filePath, (ext) => {
        if (ext) {
          let readStream = fs.createReadStream(filePath);
          var dataBuffer = [];
          response.writeHead(200, {
            "content-type": mime.getType(path.basename(filePath)),
          });
          //      readStream.pipe(response);
          readStream.on("data", (chunk) => {
            dataBuffer = [...dataBuffer, chunk];
            response.write(chunk);
          });
          readStream.on("end", () => response.end());
        } else {
          console.error("mistake:", filePath.bgRed);
          response.end();
        }
      });
    }
  }
});

server.on("close", () => {
  console.log("===================close server listerner=================\t\n".america);
});
