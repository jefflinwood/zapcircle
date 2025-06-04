import { useState } from "react";

export function SignupForm() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });

  function updateField(field, value) {
    setForm({ ...form, [field]: value });
  }

  const isStepOneValid = form.name.length > 0 && form.email.includes("@");
  const isStepTwoValid = form.password.length >= 8 && form.password === form.confirm;

  return (
    <form>
      {step === 1 && (
        <>
          <input placeholder="Name" value={form.name} onChange={e => updateField("name", e.target.value)} />
          <input placeholder="Email" value={form.email} onChange={e => updateField("email", e.target.value)} />
        </>
      )}
      {step === 2 && (
        <>
          <input placeholder="Password" type="password" value={form.password} onChange={e => updateField("password", e.target.value)} />
          <input placeholder="Confirm Password" type="password" value={form.confirm} onChange={e => updateField("confirm", e.target.value)} />
        </>
      )}
      <button type="button" onClick={() => {
        if (step === 1 && isStepOneValid) setStep(2);
        else if (step === 2 && isStepTwoValid) alert("Submitted!");
      }}>
        {step === 1 ? "Next" : "Submit"}
      </button>
    </form>
  );
}
