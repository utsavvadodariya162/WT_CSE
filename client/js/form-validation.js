(function () {
  "use strict";

  document.querySelectorAll("form[data-validate]").forEach(initializeForm);

  function initializeForm(form) {
    form.querySelectorAll('[data-rule="not-past"]').forEach(function (field) {
      field.min = localDate();
    });

    form.addEventListener("submit", function (event) {
      clearStatus(form);
      var firstInvalid = validateForm(form);

      if (firstInvalid) {
        event.preventDefault();
        firstInvalid.focus();
        return;
      }

      if (form.dataset.submitMode === "demo") {
        event.preventDefault();
        showStatus(form, "success", form.dataset.successMessage);
        if (form.hasAttribute("data-clear-on-success")) {
          clearFormValues(form);
        }
      }
    });

    form.addEventListener("input", handleFieldChange);
    form.addEventListener("change", handleFieldChange);
    form.addEventListener("reset", function () {
      window.setTimeout(function () {
        clearFormErrors(form);
        clearStatus(form);
      }, 0);
    });

    function handleFieldChange(event) {
      var field = event.target;
      if (!isFormField(field)) return;

      sanitizeField(field);
      if (field.getAttribute("aria-invalid") === "true") {
        validateField(field, form);
      }
      if (form.dataset.dateRange) {
        validateDateRange(form);
      }
      if (form.dataset.statusTarget) {
        clearStatus(form);
      }
    }
  }

  function validateForm(form) {
    var firstInvalid = null;
    var checkedRadioGroups = new Set();

    Array.prototype.forEach.call(form.elements, function (field) {
      if (!isFormField(field)) return;
      if (field.type === "radio") {
        if (checkedRadioGroups.has(field.name)) return;
        checkedRadioGroups.add(field.name);
      }

      if (!validateField(field, form) && !firstInvalid) {
        firstInvalid = field;
      }
    });

    var rangeField = validateDateRange(form);
    if (rangeField && !firstInvalid) {
      firstInvalid = rangeField;
    }
    return firstInvalid;
  }

  function validateField(field, form) {
    if (!isFormField(field) || field.disabled) return true;

    sanitizeField(field);
    if (field.type === "radio") {
      return validateRadioGroup(field, form);
    }

    var message = "";
    var value = field.value;

    if (field.required) {
      if (field.type === "checkbox" && !field.checked) {
        message = "Please check this box to continue.";
      } else if (field.type !== "checkbox" && value.trim() === "") {
        message = "This field is required.";
      }
    }

    if (!message && value !== "") {
      if (field.dataset.rule === "not-future" && value > localDate()) {
        message = "Date cannot be in the future.";
      } else {
        message = validityMessage(field);
      }
    }

    setFieldState(field, message);
    return message === "";
  }

  function validateRadioGroup(field, form) {
    var radios = Array.prototype.filter.call(
      form.querySelectorAll('input[type="radio"]'),
      function (radio) {
        return radio.name === field.name;
      }
    );
    var required = radios.some(function (radio) {
      return radio.required;
    });
    var selected = radios.some(function (radio) {
      return radio.checked;
    });
    var message = required && !selected ? "Choose an option to continue." : "";

    radios.forEach(function (radio) {
      setFieldState(radio, message);
    });
    return message === "";
  }

  function validityMessage(field) {
    var validity = field.validity;
    if (validity.typeMismatch) return "Enter a valid email address.";
    if (validity.patternMismatch) return "Enter a valid 10-digit mobile number";
    if (validity.badInput) return "Enter a valid value.";
    if (validity.rangeUnderflow) {
      return field.type === "date"
        ? "Choose today or a later date."
        : "Value must be at least " + field.min + ".";
    }
    if (validity.rangeOverflow) return "Value must be no more than " + field.max + ".";
    if (validity.stepMismatch) return "Enter a whole number.";
    return "";
  }

  function validateDateRange(form) {
    if (!form.dataset.dateRange) return null;

    var ids = form.dataset.dateRange.split(":");
    var from = document.getElementById(ids[0]);
    var to = document.getElementById(ids[1]);
    if (!from || !to) return null;

    var target = errorTarget(from);
    var message = from.value && to.value && from.value > to.value
      ? "From date must be on or before the To date."
      : "";
    setFieldState(from, message, target);
    return message ? from : null;
  }

  function setFieldState(field, message, target) {
    target = target || errorTarget(field);
    field.setAttribute("aria-invalid", message ? "true" : "false");
    field.classList.toggle("is-invalid", Boolean(message));

    if (target) {
      target.textContent = message;
      target.classList.toggle("show-alert", Boolean(message));
    }
  }

  function errorTarget(field) {
    var ids = (field.getAttribute("aria-describedby") || "").split(/\s+/);
    for (var index = 0; index < ids.length; index += 1) {
      var target = document.getElementById(ids[index]);
      if (target && target.classList.contains("field-error-msg")) return target;
    }
    return null;
  }

  function clearFormErrors(form) {
    Array.prototype.forEach.call(form.elements, function (field) {
      if (isFormField(field)) setFieldState(field, "");
    });
    if (form.dataset.dateRange) validateDateRange(form);
  }

  function clearFormValues(form) {
    form.querySelectorAll("input, textarea").forEach(function (field) {
      if (field.type === "checkbox" || field.type === "radio") {
        field.checked = false;
      } else if (!/^(button|submit|reset|hidden)$/i.test(field.type)) {
        field.value = "";
      }
    });
    form.querySelectorAll("select").forEach(function (field) {
      field.selectedIndex = -1;
    });
    clearFormErrors(form);
  }

  function sanitizeField(field) {
    if (field.dataset.inputFilter === "digits") {
      field.value = field.value.replace(/\D/g, "");
    } else if (field.dataset.inputFilter === "letters") {
      field.value = field.value.replace(/[^\p{L}\p{M}\s'-]/gu, "");
    }
  }

  function showStatus(form, type, message) {
    var target = document.getElementById(form.dataset.statusTarget);
    if (!target || !message) return;

    target.textContent = message;
    target.classList.remove("status-alert-success", "status-alert-error");
    target.classList.add("status-alert-" + type, "show-alert");
  }

  function clearStatus(form) {
    var target = document.getElementById(form.dataset.statusTarget);
    if (!target) return;

    target.textContent = "";
    target.classList.remove("show-alert", "status-alert-success", "status-alert-error");
  }

  function isFormField(field) {
    return field && /^(INPUT|SELECT|TEXTAREA)$/.test(field.tagName) &&
      !/^(button|submit|reset|hidden)$/i.test(field.type);
  }

  function localDate() {
    var now = new Date();
    var month = String(now.getMonth() + 1).padStart(2, "0");
    var day = String(now.getDate()).padStart(2, "0");
    return now.getFullYear() + "-" + month + "-" + day;
  }
})();
