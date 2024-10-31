<template>
  <div class="bg-base-200 flex items-center justify-center min-h-screen">
    <div
      class="
      iw-sm:ih-sm:card iw-sm:ih-sm:max-w-[500px] iw-sm:ih-sm:max-h-[80vh] iw-sm:ih-sm:min-h-0
      min-h-screen w-dvw bg-base-100 shadow-xl
      ah-sm:screen-center aw-sm:screen-center"
    >
      <div class="card-body flex items-center justify-center">
        <div class="w-full">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>
