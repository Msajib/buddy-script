"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Mode = "login" | "register";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error ?? "Something went wrong.");
      return;
    }

    router.push("/feed");
    router.refresh();
  }

  if (mode === "login") {
    return (
      <form className="_social_login_form" onSubmit={submit}>
        {message ? <div className="app-alert error">{message}</div> : null}
        <div className="_social_login_form_input _mar_b14">
          <label className="_social_login_label _mar_b8">Email</label>
          <input name="email" type="email" className="form-control _social_login_input" required />
        </div>
        <div className="_social_login_form_input _mar_b14">
          <label className="_social_login_label _mar_b8">Password</label>
          <input name="password" type="password" className="form-control _social_login_input" required />
        </div>
        <div className="form-check _social_login_form_check">
          <input className="form-check-input _social_login_form_check_input" type="radio" defaultChecked readOnly />
          <label className="form-check-label _social_login_form_check_label">Remember me</label>
        </div>
        <div className="_social_login_form_btn _mar_t40 _mar_b60">
          <button disabled={loading} type="submit" className="_social_login_form_btn_link _btn1">
            {loading ? "Logging in..." : "Login now"}
          </button>
        </div>
        <div className="_social_login_bottom_txt">
          <p className="_social_login_bottom_txt_para">
            Dont have an account? <Link href="/register">Create New Account</Link>
          </p>
        </div>
      </form>
    );
  }

  return (
    <form className="_social_registration_form" onSubmit={submit}>
      {message ? <div className="app-alert error">{message}</div> : null}
      <div className="row">
        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12">
          <div className="_social_registration_form_input _mar_b14">
            <label className="_social_registration_label _mar_b8">First name</label>
            <input name="firstName" className="form-control _social_registration_input" required />
          </div>
        </div>
        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12">
          <div className="_social_registration_form_input _mar_b14">
            <label className="_social_registration_label _mar_b8">Last name</label>
            <input name="lastName" className="form-control _social_registration_input" required />
          </div>
        </div>
      </div>
      <div className="_social_registration_form_input _mar_b14">
        <label className="_social_registration_label _mar_b8">Email</label>
        <input name="email" type="email" className="form-control _social_registration_input" required />
      </div>
      <div className="_social_registration_form_input _mar_b14">
        <label className="_social_registration_label _mar_b8">Password</label>
        <input name="password" type="password" minLength={8} className="form-control _social_registration_input" required />
      </div>
      <div className="form-check _social_registration_form_check">
        <input className="form-check-input _social_registration_form_check_input" type="radio" defaultChecked readOnly />
        <label className="form-check-label _social_registration_form_check_label">I agree to terms & conditions</label>
      </div>
      <div className="_social_registration_form_btn _mar_t40 _mar_b60">
        <button disabled={loading} type="submit" className="_social_registration_form_btn_link _btn1">
          {loading ? "Creating account..." : "Register now"}
        </button>
      </div>
      <div className="_social_registration_bottom_txt">
        <p className="_social_registration_bottom_txt_para">
          Already have an account? <Link href="/login">Login now</Link>
        </p>
      </div>
    </form>
  );
}
