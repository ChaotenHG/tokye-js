import tokye from "@tokye/sdk";
import { setMessage, TokyeUI } from "../main";

export function addPassKeyScreen(element: HTMLElement, tokyeui: TokyeUI) {
  element.innerHTML = `
    <h2 class="pt-10 text-center font-bold text-xl">Register a Passkey</h2>
    <p id="tokyeMessage" class="text-error text-center"></p>
    <div class="card-body items-center text-center">
      <h3 class="font-bold">Quick and secure login</h3>
      <p>No passwords needed: Use Windows Hello, Face ID, or fingerprint.</p>
      <p>Private and safe: Passkeys stay on your device.</p>

      <button class="btn btn-primary" id="tokyeAdd">add Passkey</button> 

      <div class="divider">or</div>
      <div class="card-actions">
        <button class="btn btn-neutral w-full" id="tokyeContinue">Continue without</button>
      </div>
    </div>
`;
  registerEvents(tokyeui);
}

function registerEvents(tokyeui: TokyeUI) {
  const continueBtn = document.getElementById("tokyeContinue");
  const addBtn = document.getElementById("tokyeAdd");
  if (continueBtn == null || addBtn == null) return;

  continueBtn.addEventListener("click", () => {
    tokyeui.unMountAuthElement();
  });

  addBtn.addEventListener("click", async () => {
    const err = await tokye.registerPasskey();

    if (err != undefined) {
      setMessage(err.message);
      return;
    }

    tokyeui.unMountAuthElement();
  });
}
