import {Navbar, Menu} from './styles';
 
const Header = () => {
    return(
        <Navbar>
            <h1>Header</h1>
            <Menu>
                <buttton><a href="/">Home</a></buttton>
                <buttton><a href="/about">About</a></buttton>
                <buttton><a href="/contact">Contact</a></buttton>
            </Menu>
        </Navbar>
    )
}

export default Header;