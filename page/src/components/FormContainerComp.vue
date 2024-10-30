<template>
  <div class="bg-base-200 flex items-center justify-center min-h-screen">
    <div
      class="card md:max-w-[500px] md:min-w-96 md:max-h-[80vh] md:h-auto w-dvw h-dvh bg-base-100 shadow-xl"
    >
      <div class="card-body flex items-center justify-center">
        <div class="w-full">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>
