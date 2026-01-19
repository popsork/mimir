<template lang="pug">
StyleSection(title="Sidebar")
    StyleExamples
        StyleExample
            GenericButton(type="secondary" v-on:click="toggleSidebar") Toggle Sidebar
            LayoutDrawer(v-model:show="showSidebar")
        StyleExample
            GenericButton(type="secondary" v-on:click="toggleResizableSidebar") Toggle Rezisable Sidebar
            LayoutDrawer(v-model:show="showResizableSidebar" :resizable="true")
                template(v-slot:header) Header Text
                template(v-slot) {{ content }}
                template(v-slot:footer) Footer Text
</template>
<script setup lang="ts">

const showSidebar = ref(false);
const toggleSidebar = () => {
    showSidebar.value = !showSidebar.value;
};


const showResizableSidebar = ref(false);
const toggleResizableSidebar = () => {
    showResizableSidebar.value = !showResizableSidebar.value;
};

const content = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec fermentum ante sagittis, ullamcorper eros quis, rutrum magna. Suspendisse potenti. Pellentesque nec mattis massa, quis sodales ligula. Aenean vel tincidunt lectus, in maximus ex. Aliquam luctus justo eu molestie viverra. Duis porttitor eros eu mi facilisis vulputate. Quisque vitae sagittis lorem. Morbi lectus metus, iaculis a porta ut, accumsan ut tortor. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nulla accumsan finibus dolor eget tincidunt. Praesent id justo nec leo faucibus pulvinar. Maecenas blandit vitae augue vitae venenatis.

Nam sagittis turpis ipsum, laoreet molestie nunc dignissim id. Donec pharetra accumsan orci, iaculis vestibulum orci. Maecenas ac fermentum est. Integer ultrices sit amet metus id varius. Sed ante sem, malesuada vitae sapien sed, posuere sagittis lorem. Mauris eu elementum turpis. Sed augue lacus, varius quis sodales quis, ultrices sed massa. Nulla porttitor felis a lacus porttitor semper.

Etiam sapien lectus, pellentesque in justo non, facilisis congue diam. Nulla condimentum imperdiet metus, vitae cursus metus pharetra nec. Quisque consequat augue in metus tristique euismod. Sed finibus viverra augue, quis tempor lorem laoreet vitae. Nulla pellentesque gravida ligula eget vulputate. Pellentesque et dolor quis mi pulvinar pretium in non dolor. Maecenas dui ipsum, ultricies quis accumsan consectetur, vulputate vitae ante. Nunc consectetur, nunc congue mattis viverra, nisl quam sagittis quam, vitae maximus enim lorem id turpis. Curabitur fringilla non massa vitae ullamcorper. Aenean vulputate est vel leo porttitor interdum. In porttitor imperdiet ullamcorper. Phasellus sit amet elementum nisi. Vestibulum venenatis tristique metus ac lacinia. Vivamus malesuada orci nunc, et tincidunt felis interdum in.

Fusce vel ipsum ultrices urna elementum pulvinar semper nec neque. Donec commodo enim et nisl malesuada, sed fermentum diam dapibus. Donec fringilla nulla eu dapibus vulputate. Mauris quis ultrices lorem. Vestibulum sit amet tincidunt ante. Nam eleifend mi a sollicitudin tristique. Integer sed vulputate urna. Morbi dui augue, cursus in purus ultricies, accumsan euismod est. Etiam a arcu ligula. Quisque et mi purus. Maecenas magna dolor, dignissim volutpat porttitor vitae, fermentum et urna. Suspendisse mi ex, dignissim ut placerat vel, molestie at massa.

Proin vitae libero nec dui suscipit tincidunt a eget magna. Donec in purus purus. Donec auctor enim odio. Donec vel placerat tellus, et cursus enim. Nunc commodo elementum velit, eu porttitor nisl tristique et. Praesent sem ex, bibendum id feugiat nec, cursus eget velit. Integer id hendrerit lectus.

Ut scelerisque tristique bibendum. Etiam mollis risus in arcu lobortis tempor quis id dolor. Sed congue eget quam quis consequat. Mauris fermentum hendrerit nisi, ac semper ante scelerisque et. Vestibulum pellentesque efficitur pulvinar. Etiam sagittis nisl in egestas rhoncus. Morbi rutrum orci et leo auctor eleifend. Duis dictum maximus elit ut scelerisque. Quisque a justo malesuada, viverra ipsum pretium, consequat lacus. Donec mollis lacus scelerisque eros ornare, eu ultricies erat lobortis. Suspendisse pellentesque urna quis felis pharetra, id vestibulum arcu rhoncus. Sed non ullamcorper ex.

Phasellus scelerisque finibus nisi, eget accumsan ex aliquet sed. Ut pulvinar dapibus sem et sodales. Praesent vulputate elit leo, non malesuada tellus aliquet aliquam. Vestibulum sed scelerisque mauris. Donec lobortis velit eget eros congue, eget tincidunt ligula blandit. Aenean vestibulum auctor viverra. Mauris iaculis iaculis molestie. Sed feugiat ullamcorper elit, sed interdum lectus maximus id.

Nunc hendrerit pellentesque fringilla. Maecenas pellentesque justo eget lacinia eleifend. Nunc pharetra sed ipsum id malesuada. Suspendisse sed sem tortor. Maecenas at sapien arcu. Phasellus aliquam a lacus in tristique. Morbi et tellus ligula. Aenean orci nibh, lobortis et pellentesque nec, blandit rutrum magna. Integer ac faucibus ante, vel cursus magna.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam congue facilisis eros. Nunc rutrum velit vel ultricies porta. Donec mollis pellentesque diam id efficitur. Sed vitae lacus dignissim, finibus nulla ac, tempor erat. Aliquam convallis elit tristique, maximus ante eget, rhoncus quam. Sed pretium orci odio, sit amet congue tortor luctus in.

Vestibulum non libero a ante interdum imperdiet. Maecenas imperdiet bibendum lacus, consectetur rutrum turpis. Etiam scelerisque, diam in ullamcorper viverra, nibh sapien luctus ligula, at sagittis ex erat ut metus. Duis interdum quis ligula non egestas. Mauris placerat tortor nec tempor feugiat. Mauris rhoncus quis neque non vehicula. Nullam ut eleifend quam. Nullam pharetra erat lectus, efficitur vulputate lectus feugiat in. Donec vel ligula vitae ligula luctus volutpat. Sed ut vestibulum velit. Phasellus quis est a massa faucibus fringilla ut malesuada massa. Ut pulvinar mauris eleifend enim bibendum egestas. Vivamus a nisi non massa mattis imperdiet. Nulla laoreet malesuada ipsum, a rhoncus magna aliquam ac. Nunc ornare pulvinar nisi nec aliquet. Pellentesque pellentesque ex nec erat iaculis hendrerit.

`;
</script>
<style scoped lang="scss"></style>
