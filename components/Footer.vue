<template>
    <div class="footer">
        <div class="notice">
            Foxhole is a registered trademark of Siege Camp Inc.
        </div>

        <div class="code">
            <a href="https://github.com/S0yKaf/foxhole-op-planner"> Source code on github </a>
        </div>


    </div>
</template>

<style scoped>

.footer {
    position: absolute;
    display: grid;
    grid-row: 3;
    bottom: 0;
    width: 100%;
    padding: 0.3em;
    color:  #888888;
    background-color: #000000DD;
}

.notice {
    grid-row: 1;
    font-size: 12px;
}

.code {
    grid-row: 1;
    text-align: end;
    padding-right: 1em;
}

</style>
