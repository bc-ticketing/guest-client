<template>
  <div class="camera-component" ontouchstart="" :class="size">
    <section
      id="camera"
      v-if="stream"
      class="absolute flex flex-col inset-0 items-center justify-end px-4 py-8 z-20"
    ></section>

    <div class="camera-wrapper">
      <div class="overlay top" v-if="size === 'small'"></div>
      <video ref="video" autoplay muted playsinline></video>
      <div class="overlay bottom" v-if="size === 'small'"></div>
    </div>

    <button class="md-button md-raised" @click="capturePhoto">Snap</button>
  </div>
</template>

<script>
import * as loadImage from "blueimp-load-image";

export default {
  data() {
    return {
      stream: null,
      ready: false,
      photo: null,
    };
  },
  props: {
    size: String,
  },
  mounted() {
    this.startCamera();
  },
  methods: {
    async startCamera() {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: "user",
        },
      });

      this.$refs.video.srcObject = this.stream;

      this.$refs.video.onloadedmetadata = () => {
        this.ready = true;
      };

      this.$refs.video.onended = () => {
        this.ready = false;
        this.stream = null;
      };
    },
    capturePhoto() {
      let video = this.$refs.video;

      let videoCanvas = document.createElement("canvas");
      videoCanvas.height =
        this.size === "small" ? video.videoHeight / 3 : video.videoHeight;
      videoCanvas.width = video.videoWidth;
      let videoContext = videoCanvas.getContext("2d");
      console.log(video, 0, video.videoHeight, video.videoWidth);
      if (this.size === "small") {
        videoContext.drawImage(
          video,
          0,
          video.videoHeight / 3,
          video.videoWidth,
          video.videoHeight / 3,
          0,
          0,
          video.videoWidth,
          videoCanvas.height
        );
      } else {
        videoContext.drawImage(video, 0, 0);
      }

      this.photo = loadImage.scale(videoCanvas, {
        maxHeight: 1080,
        maxWidth: 1080,
        cover: true,
        crop: true,
        canvas: true,
      });
      //console.log(videoCanvas.toDataURL("image/jpeg"));
      //this.$emit("picture", videoCanvas.toDataURL("image/jpeg"));
      videoCanvas.toBlob((blob) => {
        this.$emit("picture", blob);
        //let data = window.URL.createObjectURL(blob);
      }, "image/jpeg");
    },
  },
};
</script>

<style>
.camera-component {
  min-height: 500px;
}
.overlay {
  background: white;
  z-index: 9;
  height: 80px;
  position: absolute;
  left: 0;
  width: 100%;
}
.overlay.top {
  top: 0;
}
.overlay.bottom {
  bottom: 0;
}

.camera-wrapper {
  position: relative;
}

video {
  height: 240px;
}
</style>
