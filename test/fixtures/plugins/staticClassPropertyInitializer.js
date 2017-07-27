class EntityState extends Component {
    static propTypes = {
        entityState: PropTypes.string.isRequired
    };

    render() {
        return <div>{this.props.entityState}</div>;
    }
}