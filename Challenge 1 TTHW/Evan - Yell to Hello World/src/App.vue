<script setup>
  import {useVolumeTracker} from "./audio-analysis";
  import {computed, ref} from "vue";

  const {
    maxVolume,
    microphonePermission,
    requestMicrophoneAccess,
    processAudio,
  } = useVolumeTracker();

  const recording = ref(false);
  const done = ref(false);
  let audioProcessingCancel = null;

  const startRecording = () => {
    audioProcessingCancel = processAudio();
    recording.value = true;
  }

  const stopRecording = () => {
    audioProcessingCancel();
    recording.value = false;
    done.value = true;
  }

  const numHelloWorlds = computed(() => Math.ceil(maxVolume.value / 10));
</script>

<template>
  <main id="centerBoxContainer">
    <div class="center-box">
      <h2>Yell to hello world!</h2>
      <p>
        This program prints out "hello world" according to how loud you yell at the computer. The application
        will score your volume level between 1 and 10, and when you press "Print hello worlds!" it will print
        "hello world" a number of times equal to said score.
      </p>
      <p>
        If you don't see the bar moving after you start recording, check what input device you're using
        and check the volume for the input device in your system settings.
      </p>
      <p>
        Ready to yell?
      </p>
      <template v-if="!microphonePermission.permissionRequestAnswered">
        <p>We need permission to access your microphone. Please grant it.</p>
        <button @click="requestMicrophoneAccess()">Grant microphone access</button>
      </template>
      <template v-else-if="microphonePermission.hasMicrophonePermission">
        <div id="border">
          <span id="volumeBar" :style="{width: `${maxVolume + 10}px`}"/>
        </div>
        <p>Your volume level (number of hello worlds): {{numHelloWorlds}}</p>
        <button v-if="!recording && !done" @click="startRecording">Start yelling!</button>
        <button v-if="recording" @click="stopRecording">Print hello worlds!</button>
      </template>
      <template v-else>
        <p>No microphone permission!</p>
      </template>
    </div>

    <div class="center-box">
      <h4>Hello worlds:</h4>
      <ol v-if="!recording">
        <li v-for="num in numHelloWorlds">Hello world!</li>
      </ol>
    </div>
  </main>
</template>

<style scoped>
#volumeBar {
  height: 20px;
  background-color: red;
  display: block;
  transition: width 0.2s;
}

#border {
  width: 110px;
  height: 20px;
  border: 2px solid black;
}

#centerBoxContainer {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.center-box {
  max-width: 25%;
  padding: 16px;
  margin: 8px;
  border-radius: 8px;
  border: 2px solid black;
}
</style>
