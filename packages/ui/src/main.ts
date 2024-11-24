import { DefaultScreen } from "./screens/default";

export class TokyeUI {
  authElment: HTMLElement | undefined;

  mountAuthElment(parent: HTMLElement) {
    this.authElment = parent;

    const div = document.createElement("div");
    div.classList.add("card", "bg-base-200", "w-96", "shadow-xl", "relative");
    parent.appendChild(div);

    const loading = document.createElement("div");
    loading.classList.add(
      "absolute",
      "top-1/2",
      "left-1/2",
      "-translate-x-1/2",
      "-translate-y-1/2",
    );
    loading.id = "tokyeLoading";

    DefaultScreen(div, this, true);

    div.appendChild(loading);
  }

  unMountAuthElement() {
    if (this.authElment == undefined) return;

    this.authElment.innerHTML = "";
  }
}

export function setMessage(message: string) {
  const p = document.getElementById("tokyeMessage");

  if (p == null) return;

  p.innerText = message;
}

export function setLoading(bool: Boolean) {
  const div = document.getElementById("tokyeLoading");
  if (div == null) return;

  if (bool) {
    div.innerHTML = `<span class="loading loading-bars w-24"></span>`;
  } else {
    div.innerHTML = "";
  }
}
