import ScratchCard from "./ScratchCard";
import type { App } from "vue";

export default {
  install(app: App) {
    app.component("vue-scratchcard", ScratchCard);
  }
}
