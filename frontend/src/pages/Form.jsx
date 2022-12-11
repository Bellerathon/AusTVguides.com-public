import React from "react";
import "./Form.css";

function ContactForm() {
  return (
    <form className="contact-form" action="https://formspree.io/f/myyokkrd" method="POST">
      <label>Your email (optional):</label>
      <input type="email" name="_replyto" style={{ height: "1rem", width: "20rem", padding: "5px", borderRadius: "0.5rem" }} />
      <label>Your message:</label>
      <textarea name="message" className="contact-form-message"></textarea>
      <button type="submit" style={{ height: "2.5rem", width: "7rem" }}>
        Send
      </button>
    </form>
  );
}

export default ContactForm;
