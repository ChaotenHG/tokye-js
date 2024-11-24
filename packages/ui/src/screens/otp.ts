import tokye from "@tokye/sdk";
import { setLoading, setMessage, TokyeUI } from "../main";
import { getEmailSVG, getEditSVG } from "../SVG";
import { addPassKeyScreen } from "./addPassKey";
import { DefaultScreen } from "./default";

export async function OTPScreen(
  element: HTMLElement,
  tokyeui: TokyeUI,
  register: boolean,
) {
  element.innerHTML = `
  <h2 class="pt-10 text-center font-bold text-xl">Enter the Code</h2>
    <p id="tokyeMessage" class="text-error text-center"></p>
  <div class="card-body items-center text-center">
  <div class="w-full pb-10"> 
    <label class="input input-bordered flex items-center gap-1">
    ${getEmailSVG()}
    <p>${tokye.getEmail() || "Error"}</p>
    <div class="cursor-pointer" id="tokyeEdit">${getEditSVG()}</div>
  </div>

    <form class="flex gap-2" id="tokyeForm"> 
      ${InputArray(6)}
    </form>
    <div class="divider"></div>

    <div class="card-actions flex items-center justify-center">
      Didn't receive an email?
      <button id="tokyeButton" class="btn bg-base-100 btn-disabled">Resend code</button>
    </div>
  </div>

`;

  requestOTP();
  registerEvents(element, tokyeui, register);
}

function registerEvents(
  element: HTMLElement,
  tokyeui: TokyeUI,
  register: boolean,
) {
  const form = document.getElementById("tokyeForm");
  const btn = document.getElementById("tokyeButton");

  if (form == null || btn == null) return;

  form.addEventListener("keydown", (event) => {
    if (event.target == null) return;

    const target = event.target as HTMLInputElement;

    let input;

    if (event.key == "ArrowRight") {
      input = target.nextElementSibling as HTMLInputElement;
      event.preventDefault();
    }
    if (event.key == "ArrowLeft" || event.key == "Backspace") {
      input = target.previousElementSibling as HTMLInputElement;

      if (event.key != "Backspace") {
        event.preventDefault();
      }
    }

    if (!input) return;

    input.focus();
    input.setSelectionRange(0, 1);
  });

  form.addEventListener("click", (event) => {
    if (event.target == null) return;

    const target = event.target as HTMLInputElement;

    target.setSelectionRange(0, 1);
  });
  form.addEventListener("paste", (event) => {
    const text = event.clipboardData?.getData("text");
    if (text == undefined) return;

    for (let index = 0; index < text.length; index++) {
      const element = form.children.item(index) as HTMLInputElement;

      element.value = text[index];
    }
  });

  form.addEventListener("input", async (event) => {
    const target = event.target as HTMLInputElement;

    const value = target.value;

    if (value == "") return;

    const next = target.nextElementSibling as HTMLInputElement;

    if (next != null) {
      next.focus();
    }

    let code = "";

    // check if every input is filled
    for (let index = 0; index < form.children.length; index++) {
      const element = form.children.item(index) as HTMLInputElement;
      if (!element.value) {
        code = "";
        return;
      }
      code += element.value;
    }

    setLoading(true);

    const err = await tokye[register ? "register" : "login"](code);
    setLoading(false);

    if (err) {
      setMessage(err.message);

      if (err.message == "Wrong code") {
        for (let index = 0; index < form.children.length; index++) {
          const element = form.children.item(index) as HTMLInputElement;

          if (index == 0) {
            element.focus();
          }

          element.value = "";
        }
      }

      return;
    }
    addPassKeyScreen(element, tokyeui);
  });

  btn.addEventListener("click", () => {
    requestOTP();
  });

  document.getElementById("tokyeEdit")?.addEventListener("click", () => {
    DefaultScreen(element, tokyeui, true);
  });
}

async function requestOTP() {
  setLoading(true);

  const { error, time } = await tokye.requestOTP();

  setLoading(false);

  if (error != null) {
    setMessage(error.message);
    return;
  }

  const btn = document.getElementById("tokyeButton");
  if (btn == null) return;

  startCountdown(btn, time);
}

async function startCountdown(btn: HTMLElement, time: number) {
  btn.classList.add("btn-disabled");

  let timer = time / 1_000_000_000;

  const id = setInterval(() => {
    timer -= 1;
    btn.innerText = `Resend code (${timer} sec)`;

    if (timer == 0) {
      btn.classList.remove("btn-disabled");
      btn.innerText = "Resend code";

      clearInterval(id);
      return;
    }
  }, 1000);
}

function InputArray(amount: number) {
  let output = "";

  for (let index = 0; index < amount; index++) {
    output += InputChar() + "\n";
  }

  return output;
}

function InputChar() {
  return `<input maxlength="1" class="input input-bordered px-0 text-center w-1/6 h-14"/>`;
}
