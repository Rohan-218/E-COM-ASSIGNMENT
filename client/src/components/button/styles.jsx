import styled from 'styled-components'

export const LoginButton = styled.button`
    padding: 10px 20px;
    margin-top: 20px;
    font-size: 18px;
    cursor: pointer;
    background-color: #4d87c1;
    color: white;
    border: none;
    border-radius: 5px;
    width: 95%;

    &:hover {
        background-color: white;
        border: 0.5px solid #4d87c1;
        transition: background-color 0.3s ease-in-out, border-color 0.3s ease-in-out;
        color: #4d87c1;
    }
`