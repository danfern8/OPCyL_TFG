<template>
    <div class="flex-container rounded-pill ">
    <div class="word">
        {{wordComponent}}
        <v-icon 
        @click="$emit('remove', indexComponent)"
        >mdi-close</v-icon>
    </div>
    </div>
</template>

<script>


export default {
    name: "KeywordTag",
    props:[
        "wordComponent",
        "indexComponent"
    ],
}
</script>

<style scoped>

.flex-container{
    width: fit-content;
    padding: 3.5px;
    margin-bottom: 0.5rem;
    margin-right: 0.2rem;
    background: #E8E8E8;
}

.word{
    margin-left: 0.5rem;
    margin-right: 0.5rem; 
    display:flex;
}

.mdi-close{
    font-size: 19px!important;
    margin-left: 0.2rem;
}
</style>