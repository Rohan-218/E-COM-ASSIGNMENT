import styled from 'styled-components';

export const Sidebar = styled.div`
    background-color: #4d87c1;
    display: flex;
    position: fixed;
    width: 20dvw;
    z-index: 1000;
    height: 87dvh;
    margin: 3dvh 2.5dvw 3dvh 2.5dvw;
    border-radius: 8px;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    button {
        display: grid;
        background-color: white;
        height: 4dvh;
        width: 10dvw;
        margin: 4% 0;
        border-radius: 8px;
    }

    button:hover {
        opacity: 0.8;
    }
`