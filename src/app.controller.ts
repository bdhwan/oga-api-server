import { Controller, Get, Res, Req } from "@nestjs/common";
import { AppService } from "./app.service";

const exec = require("child_process").exec;
const Gpio = require("onoff").Gpio; // Gpio class
const led = new Gpio(21, "out");

@Controller()
export class AppController {
  width = 640;
  height = 480;

  // ps -ef | grep -v grep | grep test-launch
  constructor(private readonly appService: AppService) {
    this.startServer();
  }

  async startServer() {
    const ledResult = await led.read();
    console.log("ledResult", ledResult);
    await led.write(1);
    this.startTcp();
  }

  async startTcp() {
    const commend = `ps -ef | grep 'test-launch' | grep -v grep | awk '{print $2}' | xargs -r kill -9 && sleep 3 && /home/pi/gst-rtsp-server-1.14.4/examples/test-launch --gst-debug=1 "( rpicamsrc bitrate=8000000 preview=false ! video/x-h264, width=${this.width}, height=${this.height}, framerate=30/1 ! h264parse ! rtph264pay name=pay0 pt=96 )"`;
    exec(commend, function(error, stdout, stderr) {
      console.log("stdout: " + stdout);
      console.log("stderr: " + stderr);
      if (error !== null) {
        console.log("exec error: " + error);
      }
    });
  }
  


  async startUdp(ip: string) {
    // .then(value => led.write(value ^ 1))
    // const commend = `/home/pi/gst-rtsp-server-1.14.4/examples/test-launch --gst-debug=3 "( rpicamsrc bitrate=800000  preview=false ! video/x-h264, width=1350, height=720, framerate=30/1 ! h264parse ! rtph264pay name=pay0 pt=96 )"`;
    // const commend = `/home/pi/gst-rtsp-server-1.14.4/examples/test-launch --gst-debug=3 "( rpicamsrc bitrate=800000  preview=false ! video/x-h264, width=1350, height=720, framerate=30/1 ! h264parse ! rtph264pay name=pay0 pt=96 )"`;
    // /test-launch --gst-debug=3 "( rpicamsrc bitrate=8000000 awb-mode=tungsten preview=false ! video/x-h264, width=640, height=480, framerate=30/1 ! h264parse ! rtph264pay name=pay0 pt=96 )"
    // const commend = `/home/pi/gst-rtsp-server-1.14.4/examples/test-launch --gst-debug=3 "( rpicamsrc bitrate=800000  preview=false ! video/x-h264, width=1350, height=720, framerate=30/1 ! h264parse ! rtph264pay name=pay0 pt=96 )"`;

    const commend = `ps -ef | grep 'gst-launch-1.0' | grep -v grep | awk '{print $2}' | xargs -r kill -9 && sleep 3 && raspivid -t 999999 -h 720 -w 1080 -fps 25 -b 2000000 -o - | gst-launch-1.0 -v fdsrc fd=0 ! h264parse ! rtph264pay ! udpsink host=${ip} port=5000`;
    console.log("will start", commend);
    exec(commend, function(error, stdout, stderr) {
      console.log("stdout: " + stdout);
      console.log("stderr: " + stderr);
      if (error !== null) {
        console.log("exec error: " + error);
      }
    });
  }


  stopVideo() {
    led.write(0);
    return new Promise((resolve, reject) => {
      console.log("will stopVideo");
      const commend = `ps -ef | grep 'gst-launch-1.0' | grep -v grep | awk '{print $2}' | xargs -r kill -9`;
      exec(commend, function(error, stdout, stderr) {
        console.log("stdout: " + stdout);
        console.log("stderr: " + stderr);
        if (error !== null) {
          console.log("exec error: " + error);
        }
        resolve(true);
      });
    });
  }

  @Get()
  getHello(@Res() res) {
    res.json({
      check: true,
    });
  }

  @Get("check")
  check(@Res() res) {
    res.json({
      check: true,
      width: this.width,
      height: this.height,
    });
  }

  @Get("start")
  start(@Res() res) {
    console.log("will return");
    // this.startVideo();
    res.json({
      check: true,
    });
  }

  @Get("stop")
  async stop(@Res() res) {
    await this.stopVideo();
    res.json({
      check: true,
    });
  }

  @Get("set")
  async set(@Req() req, @Res() res) {
    //ip extract
    let ip = null;
    console.log("headers", req.headers);

    if (req.headers["x-forwarded-for"]) {
      ip = req.headers["x-forwarded-for"].split(",")[0];
    }
    if (!ip) {
      ip = req.query.ip;
    }
    // try {
    //   await this.stopVideo();
    // } catch (ex) {
    //   console.log("ex!!");
    // }
    // await this.startVideo(ip);
    this.width = req.query.width;
    this.height = req.query.height;
    await this.startTcp();

    res.json({
      check: true,
      ip,
    });
  }

  @Get("play")
  async play(@Req() req, @Res() res) {
    //ip extract
    let ip = null;
    console.log("headers", req.headers);

    if (req.headers["x-forwarded-for"]) {
      ip = req.headers["x-forwarded-for"].split(",")[0];
    }
    if (!ip) {
      ip = req.query.ip;
    }
    // try {
    //   await this.stopVideo();
    // } catch (ex) {
    //   console.log("ex!!");
    // }

    // await this.startVideo(ip);

    res.json({
      check: true,
      ip,
    });
  }
}
