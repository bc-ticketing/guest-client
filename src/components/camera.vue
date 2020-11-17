<template>
  <div class="camera-wrapper" ontouchstart="">
    <section
      id="camera"
      v-if="stream"
      class="absolute flex flex-col inset-0 items-center justify-end px-4 py-8 z-20"
    ></section>

    <!-- <img :src="photo.toDataURL('image/jpeg')" alt="Photo" class="h-64 w-64" /> -->
    <video
      ref="video"
      class="absolute h-full inset-0 object-cover w-full z-10"
      autoplay
      muted
      playsinline
    ></video>
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
  mounted() {
    this.startCamera();
  },
  methods: {
    async startCamera() {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: "environment",
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
      videoCanvas.height = video.videoHeight;
      videoCanvas.width = video.videoWidth;
      let videoContext = videoCanvas.getContext("2d");

      videoContext.drawImage(video, 0, 0);

      this.photo = loadImage.scale(videoCanvas, {
        maxHeight: 1080,
        maxWidth: 1080,
        cover: true,
        crop: true,
        canvas: true,
      });
      //console.log(videoCanvas.toDataURL("image/jpeg"));
      //this.$emit("picture", videoCanvas.toDataURL("image/jpeg"));
      this.photo.toBlob((blob) => {
        this.$emit("picture", blob);
        //let data = window.URL.createObjectURL(blob);
      }, "image/jpeg");
      
    },
    downloadPhoto() {
      
    },
  },
};
</script>

<style>


.camera-wrapper {
  min-height: 300px;
}
</style>
