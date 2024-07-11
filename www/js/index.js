/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
  // Cordova is now initialized. Have fun!

  console.log("Running cordova-" + cordova.platformId + "@" + cordova.version);
  document.getElementById("deviceready").classList.add("ready");
  window.wakeuptimer.bind(
    (result) => {
      switch (result.type) {
        case "set":
          console.info("alarm set:", result);
          break;
        case "wakeup":
          console.info("alarm triggered:", result);
          break;
        case "stopped":
          console.info("alarm stopped:", result);
          break;
        default:
          console.error("alarm unhandled", result);
          break;
      }
    },
    (err) => onslotchange.error("alarm error:", err)
  );
  const successCallback = (result) => console.info("success:", result);
  const errorCallback = (err) => console.error("error:", err);
  window.wakeuptimer.checkAlarmPerm(function (allowed) {
    console.log("Alarm permission already granted? ", allowed ? "yes" : "no");
    if (!allowed) {
      window.wakeuptimer.openAppAlarmSettings(function (opened) {
        console.log(
          "App notification settings opened? ",
          opened ? "yes" : "no"
        );
      }, errorCallback);
    }
  }, errorCallback);
  window.wakeuptimer.checkNotificationPerm(function (allowed) {
    console.log(
      "Notification permission already granted? ",
      allowed ? "yes" : "no"
    );
    if (!allowed) {
      window.wakeuptimer.requestNotificationPerm(function (allowed) {
        console.log(
          "Notification permission was granted? ",
          allowed ? "yes" : "no"
        );
      }, errorCallback);
    }
  }, errorCallback);
  window.wakeuptimer.checkAutoStartPrefs(function (hasAutoStartPreferences) {
    if (hasAutoStartPreferences) {
      console.log("Auto Start preference available!");
    } else {
      window.wakeuptimer.openAutoStartPrefs(function (openedPreferences) {
        if (openedPreferences) {
          console.log("Auto Start preference opened");
        }
      }, errorCallback);
    }
  }, errorCallback);
  window.cordova.plugins.NativeRingtones.getRingtone((nativeRingtones) => {
    console.info("nativeRingtones:", nativeRingtones);
    window.wakeuptimer.configure(successCallback, errorCallback, {
      ringtone: nativeRingtones[0].Url,
    });
  }, errorCallback);
  document.querySelector("#alarm_set").addEventListener("click", (e) => {
    const inputValue = document.querySelector("#alarm_time").value;
    const alarmTime = new Date(inputValue || Date.now() + 60 * 1000);
    window.wakeuptimer.wakeup(successCallback, errorCallback, {
      alarms: [
        {
          type: "onetime",
          time: { hour: alarmTime.getHours(), minute: alarmTime.getMinutes() },
          extra: {
            message:
              "json containing app-specific information to be posted when alarm triggers",
          },
        },
      ],
    });
  });
  document.querySelector("#alarm_stop").addEventListener("click", (e) => {
    window.wakeuptimer.stop(successCallback, errorCallback);
  });

  const pj = cordova.plugins.PJSIPWrapper;
  pj.start({
    minPort: 5060,
    maxPort: 5070,
    logger: (level, log) => console.log(level, log),
  });
}
