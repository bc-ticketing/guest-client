<template>
  <div class="button" @click="click" ref="button">
    <span class="ripple" ref="ripple"></span>
    <span class="label"> {{ label }}</span>
  </div>
</template>

<script>
export default {
  name: "Button",
  data() {
    return {};
  },
  props: {
    label: String,
  },
  methods: {
    click: function(event) {
      var ripple = this.$refs["ripple"];
      var button = this.$refs["button"];
      var x = event.pageX - button.offsetLeft;
      var y = event.pageY - button.offsetTop;
      ripple.style.display = "block";
      ripple.style.top = y + "px";
      ripple.style.left = x + "px";
      setTimeout(function() {
        ripple.style.display = "none";
      }, 1000);
      this.$emit("click");
    },
  },
};
</script>

<style scoped>
.button {
    display: inline-block;
  padding: 10px 20px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: max-content;
  background-color: var(--button-neutral);
}
.button.round {
    border-radius: 15px;
}
.button .ripple {
  display: none;
  position: absolute;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.3);

  width: 100px;
  height: 100px;
  margin-top: -50px;
  margin-left: -50px;

  animation: ripple 1s;
  opacity: 0;
}
.button.label {
  color: var(--fg);
}
.button.confirm {
  background-color: var(--button-confirm);
  color: var(--fg-light);
}
.button.cancel {
  background-color: var(--button-cancel);
  color: var(--fg-light);
}

@keyframes ripple {
  from {
    opacity: 1;
    transform: scale(0);
  }
  to {
    opacity: 0;
    transform: scale(10);
  }
}
</style>
