import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';

const exec = require('child_process').exec;
const Gpio = require('onoff').Gpio; // Gpio class
const led = new Gpio(21, 'out');

@Controller()
export class AppController {

  // ps -ef | grep -v grep | grep test-launch

  constructor(private readonly appService: AppService) {

    this.startVideo();
  }


  async startVideo() {

    await this.stopVideo();

    const ledResult = await led.read();
    console.log('ledResult', ledResult);
    await led.write(1);
    // .then(value => led.write(value ^ 1))
    // const commend = `/home/pi/gst-rtsp-server-1.14.4/examples/test-launch --gst-debug=3 "( rpicamsrc bitrate=800000  preview=false ! video/x-h264, width=1350, height=720, framerate=30/1 ! h264parse ! rtph264pay name=pay0 pt=96 )"`;
    // const commend = `/home/pi/gst-rtsp-server-1.14.4/examples/test-launch --gst-debug=3 "( rpicamsrc bitrate=800000  preview=false ! video/x-h264, width=1350, height=720, framerate=30/1 ! h264parse ! rtph264pay name=pay0 pt=96 )"`;
  
    const commend = `/home/pi/gst-rtsp-server-1.14.4/examples/test-launch --gst-debug=3 "( rpicamsrc bitrate=8000000 preview=false ! video/x-h264, width=640, height=480, framerate=30/1 ! h264parse ! rtph264pay name=pay0 pt=96 )"`;


    console.log('will start');
    exec(commend, function (error, stdout, stderr) {
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      if (error !== null) {
        console.log('exec error: ' + error);
      }
    });

  }

  stopVideo() {
    
    led.write(0);

    return new Promise((resolve, reject) => {
      console.log('will stopVideo');


      const commend = `ps -ef | grep 'test-launch' | grep -v grep | awk '{print $2}' | xargs -r kill -9`
      exec(commend, function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
          console.log('exec error: ' + error);
        }
        resolve(true);
      });
    });



  }


  @Get()
  getHello(@Res() res) {
    res.json({
      check: true
    });
  }

  @Get('check')
  check(@Res() res) {
    res.json({
      check: true
    });
  }

  @Get('start')
  start(@Res() res) {
    console.log('will return');
    this.startVideo();
    res.json({
      check: true
    });
  }

  @Get('stop')
  async stop(@Res() res) {
    await this.stopVideo();
    res.json({
      check: true
    });
  }
}
