<script lang="ts" context="module">
  import { writable } from "svelte/store";

  const STORE_KEY = "autolaunch";

  export function getShouldAutolaunch() {
    let asString = localStorage.getItem(STORE_KEY);
    if (!asString)
      return false;

    return Boolean(JSON.parse(asString));
  }

  export function resetShouldAutolaunch() {
    localStorage.removeItem(STORE_KEY);
  }

  // @ts-ignore
  window.getShouldAutolaunch = getShouldAutolaunch;

  // @ts-ignore
  window.resetShouldAutolaunch = resetShouldAutolaunch;

  function createPersistedStore<T>(key: string, initialValue: T) {
    const storedValue = localStorage.getItem(key);
    const store = writable<T>(
      storedValue !== null ? JSON.parse(storedValue) : initialValue
    );

    store.subscribe(value => {
      localStorage.setItem(key, JSON.stringify(value));
    });

    return store;
  }

  export const checkboxState = createPersistedStore(STORE_KEY, false);
</script>

<label class="flex items-center gap-x-2">
  <input
    type="checkbox"
    class="switch switch-bordered-warning switch-md"
    bind:checked={$checkboxState}
  />
  <span class="text-[#c9c2c2] font-medium">Auto lauch</span>
</label>
