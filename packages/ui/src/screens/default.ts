import { getEmailSVG } from "../SVG";
import { setMessage, TokyeUI } from "../main";
import { OTPScreen } from "./otp";
import tokye from "@tokye/sdk";
import { LoginScreen } from "./login";

const emailRegex = /^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/gm;

export function DefaultScreen(
  element: HTMLElement,
  tokyeui: TokyeUI,
  register: boolean,
) {
  const header = register ? "Create your Account" : "Log in";
  const footer = register
    ? `You already have an account?<a class="link link-primary" id="tokyeLogin">Log in</a>`
    : `You don't have an account?<a class="link link-primary" id="tokyeLogin">Register</a>`;

  element.innerHTML = `
    <h2 class="pt-10 text-center font-bold text-xl">${header}</h2>
    <p id="tokyeMessage" class="text-error text-center"></p>
    <div class="card-body items-center text-center">
      <form id="tokyeForm" class="gap-2 flex flex-col">
        <div class="w-full"> 
          <label class="input input-bordered flex items-center gap-1">
          ${getEmailSVG()}
          <input type="text" value="${tokye.getEmail()}" name="email" class="grow bg-base-100" placeholder="Email" id="tokyeEmail"/>
        </div>
        <button class="btn btn-primary w-full" id="tokyeContinue">Continue</button>
      </form>
       <div class="divider"></div>

      <div class="card-actions">
        ${footer}
      </div>
    </div>
`;

  registerEvents(element, tokyeui, register);
}

function registerEvents(
  element: HTMLElement,
  tokyeui: TokyeUI,
  register: boolean,
) {
  const form = document.getElementById("tokyeForm") as HTMLFormElement;
  const btn = document.getElementById("tokyeLogin");

  if (form == null || btn == null) return;

  form.addEventListener("change", () => {
    const data = new FormData(form);

    const email = data.get("email")?.toString() || "";
    if (email.match(emailRegex) == null) {
      return;
    }
    tokye.setEmail(email);
  });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = new FormData(form);

    const email = data.get("email")?.toString() || "";
    if (email.match(emailRegex) == null) {
      setMessage("Not a vaild Email address");
      return;
    }

    tokye.setEmail(email);
    if (register) {
      OTPScreen(element, tokyeui, register);
    } else {
      LoginScreen(element, tokyeui);
    }
  });

  btn.addEventListener("click", () => {
    DefaultScreen(element, tokyeui, !register);
  });
}
