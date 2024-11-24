import tokye from "@tokye/sdk";
import { setLoading, setMessage, TokyeUI } from "../main";
import { getEditSVG, getEmailSVG } from "../SVG";
import { DefaultScreen } from "./default";
import { OTPScreen } from "./otp";

export function LoginScreen(element: HTMLElement, tokyeui: TokyeUI) {
  element.innerHTML = `
  <h2 class="pt-10 text-center font-bold text-xl">Log in using</h2>
    <p id="tokyeMessage" class="text-error text-center"></p>
  <div class="card-body items-center text-center">
  <div class="w-full pb-10"> 
    <label class="input input-bordered flex items-center gap-1">
    ${getEmailSVG()}
    <p>${tokye.getEmail() || "Error"}</p>
    <div class="cursor-pointer" id="tokyeEdit">${getEditSVG()}</div>
  </div>

    <button class="btn btn-primary w-2/3" id="tokyePasskey">Passkey</button>
    <button class="btn btn-neutral w-2/3" id="tokyeOTP">Email Code</button>

    <div class="divider"></div>

    <div class="card-actions flex items-center justify-center">
      You don't have an account?<a class="link link-primary" id="tokyeLogin">Register</a>
    </div>
  </div>
`;
  registerEvents(element, tokyeui);
}

function registerEvents(element: HTMLElement, tokyeui: TokyeUI) {
  const passkeyBtn = document.getElementById("tokyePasskey");
  const otpBtn = document.getElementById("tokyeOTP");
  const registerBtn = document.getElementById("tokyeLogin");

  if (passkeyBtn == null || otpBtn == null || registerBtn == null) return;

  otpBtn.addEventListener("click", () => {
    OTPScreen(element, tokyeui, false);
  });

  passkeyBtn.addEventListener("click", async () => {
    setLoading(true);
    const err = await tokye.loginPassKey();
    setLoading(false);

    if (err != undefined) {
      setMessage(err.message);
      return;
    }

    tokyeui.unMountAuthElement();
  });

  registerBtn.addEventListener("click", () => {
    DefaultScreen(element, tokyeui, true);
  });
}
