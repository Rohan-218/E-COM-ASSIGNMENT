import { Navbar } from '../header/styles.jsx';
import { Sidebar } from '../sidebar/styles.jsx';
import { Container, ChildContainer, Holder } from './styles.jsx';

const Page = () => {
    return (
        <Container>
            <Navbar>
                <h1>Rakshita Panda</h1>
            </Navbar>
            <ChildContainer>
                <div>
                    <Sidebar>
                        <button></button>
                        <button></button>
                        <button></button>
                    </Sidebar>
                </div>
                <div>
                    <Holder />
                    <Holder />
                    <Holder />
                </div>
            </ChildContainer>
        </Container>
    )
}
export default Page;