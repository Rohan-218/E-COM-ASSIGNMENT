import styled from 'styled-components';

export const Container = styled.div`
    background-color: white;
    display: grid;
    grid-template-rows: 7dvh 93dvh;
    position: relative;
    width: 100vw;
    overflow-x: hidden;
`

export const ChildContainer = styled.div`
    display: grid;
    grid-template-columns: 25dvw 75dvw;
    margin-top: 7dvh;
`

export const Holder = styled.div`
    height: fit-content;
    min-height : 87dvh;
    margin: 3dvh 2.5dvw 3dvh 1dvw;
    background-color: #ccc;
    border-radius: 8px;
    padding: 0;
`