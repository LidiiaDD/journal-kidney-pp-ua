"use client";

import { useEffect, useState } from "react";

/**
 * A lightweight in-browser navigation safeguard. Text is not copied into
 * localStorage, sessionStorage, cookies or network requests.
 *
 * This protects the editor from accidentally publishing stale saved data,
 * but never acts as a substitute for server-side publication authorization.
 */
export default function UnsavedDraftGuard({
  editorFormId,
  publishFormId,
}: {
  editorFormId: string;
  publishFormId?: string;
}) {
  const [hasChanges, setHasChanges] = useState(false);
  const [blockedPublish, setBlockedPublish] = useState(false);

  useEffect(() => {
    const editorForm = document.getElementById(editorFormId);
    if (!(editorForm instanceof HTMLFormElement)) return;

    let dirty = false;
    let saving = false;

    const onEdit = () => {
      dirty = true;
      saving = false;
      setHasChanges(true);
      setBlockedPublish(false);
    };

    const onSave = () => {
      // Native validation prevents submit from firing when a required field is
      // invalid. Otherwise the server action controls saving and redirects.
      saving = true;
    };

    const onUnload = (event: BeforeUnloadEvent) => {
      if (!dirty || saving) return;
      event.preventDefault();
      event.returnValue = "";
    };

    const publishForm = publishFormId
      ? document.getElementById(publishFormId)
      : null;

    const onPublish = (event: Event) => {
      if (!dirty) return;
      // Capture this event before React handles the server action.
      event.preventDefault();
      event.stopImmediatePropagation();
      setBlockedPublish(true);
      editorForm.querySelector<HTMLButtonElement>('button[type="submit"]')
        ?.scrollIntoView({ block: "center", behavior: "smooth" });
    };

    editorForm.addEventListener("input", onEdit);
    editorForm.addEventListener("change", onEdit);
    editorForm.addEventListener("submit", onSave, true);
    window.addEventListener("beforeunload", onUnload);
    if (publishForm instanceof HTMLFormElement) {
      publishForm.addEventListener("submit", onPublish, true);
    }

    return () => {
      editorForm.removeEventListener("input", onEdit);
      editorForm.removeEventListener("change", onEdit);
      editorForm.removeEventListener("submit", onSave, true);
      window.removeEventListener("beforeunload", onUnload);
      if (publishForm instanceof HTMLFormElement) {
        publishForm.removeEventListener("submit", onPublish, true);
      }
    };
  }, [editorFormId, publishFormId]);

  return (
    <div className="jrs-draft-guard" aria-live="polite">
      {hasChanges ? (
        <div className="jrs-draft-guard-warning" role="status">
          <strong>Є незбережені зміни.</strong>
          <span>Спочатку натисніть «Зберегти чернетку». Під час виходу
            зі сторінки браузер може показати попередження.</span>
        </div>
      ) : (
        <p className="jrs-draft-guard-clean">
          Зміни у формі не зберігаються автоматично. Перед переходом на
          іншу сторінку скористайтеся кнопкою збереження.
        </p>
      )}
      {blockedPublish && (
        <div className="jrs-draft-guard-blocked" role="alert">
          Публікацію не розпочато: у формі є незбережені правки.
          Збережіть чернетку, знову перегляньте остаточну версію
          й лише потім підтвердьте оприлюднення.
        </div>
      )}
    </div>
  );
}
