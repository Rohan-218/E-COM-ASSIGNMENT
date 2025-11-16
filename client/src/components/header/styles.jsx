import styled from 'styled-components';

export const Navbar = styled.nav`
    background-color: #4d87c1;
    position: fixed;
    width: 100dvw;
    height: 7dvh;
    z-index: 9999;
    justify-content: space-between;
    padding: 0;
    display: flex;
    align-items: center;

    h1 {
    color: white;
    font-weight: 700;
    font-size: 2.1rem;
    padding: 0;
    margin: 0 0 0 2dvw;
    }
`

export const Menu = styled.div`
    display: flex;
    align-items: center;
    gap : 40px;
    margin: 0 2dvw 0 0;

    a{
        color: white;
    }
`