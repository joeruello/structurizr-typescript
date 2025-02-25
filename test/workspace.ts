import { Workspace, Location, InteractionStyle, ElementStyle, RelationshipStyle, Shape, Tags } from "../src";

export const createWorkspace: () => Workspace = () => {
    const workspace = new Workspace();
    workspace.name = "Monkey Factory";

    const user = workspace.model.addPerson("User", "uses the system")!;

    const admin = workspace.model.addPerson("Admin", "administers the system and manages user")!;

    admin!.interactsWith(user!, "manages rights");

    const factory = workspace.model.addSoftwareSystem("Monkey Factory", "Oversees the production of stuffed monkey animals")!;
    factory.location = Location.Internal;
  
    const ingress = factory.addContainer("ingress", "accepts incoming telemetry data", "IoT Hub")!;
    ingress.tags.add("queue");

    const storage = factory.addContainer("storage", "stores telemetry data", "Table Storage")!;
    storage.tags.add("database");

    const frontend = factory.addContainer("frontend", "visualizes telemetry data", "React")!;
    ingress.uses(storage, "store telemetry", "IoT Hub routing", InteractionStyle.Asynchronous);
    frontend.uses(storage, "load telemetry data", "Table Storage SDK");

    const crm = workspace.model.addSoftwareSystem("CRM system", "manage tickets")!;
    crm.location = Location.External;
    factory.uses(crm, "Create tickets", "AMQP", InteractionStyle.Asynchronous);

    user.uses(factory, "view dashboards");
    user.uses(frontend, "view dashboards");
    admin.uses(factory, "configure users");
    admin.uses(frontend, "configure users");
    admin.uses(crm, "work on tickets");

    const ingressNode = workspace.model.addDeploymentNode("IoT Hub", "Ingress", "Azure IoT Hub", null, "DEV", 2)!;
    ingressNode.add(ingress);

    const storageNode = workspace.model.addDeploymentNode("Storage", "Storage", "Azure Storage Account with web hosting enabled", null, "DEV", 1)!;
    storageNode.add(storage);
    storageNode.add(frontend);;

    const systemContext = workspace.views.createSystemContextView(factory, "factory-context", "The system context view for the monkey factory");
    systemContext.addNearestNeighbours(factory);

    const containerView = workspace.views.createContainerView(factory, "factory-containers", "Container view for the monkey factory");
    containerView.addAllContainers();
    containerView.addNearestNeighbours(factory);

    const deploymentView = workspace.views.createDeploymentView("factory-deployment", "The deployment view fo the monkey factory", factory);
    deploymentView.addAllDeploymentNodes();

    const dbStyle = new ElementStyle("database");
    dbStyle.shape = Shape.Cylinder;
    
    const queueStyle = new ElementStyle("queue");
    queueStyle.shape = Shape.Pipe;
    
    const syncStyle = new RelationshipStyle(Tags.Synchronous);
    syncStyle.dashed = false;
    
    const asyncStyle = new RelationshipStyle(Tags.Asynchronous);
    asyncStyle.dashed = true;

    workspace.views.configuration.styles.addElementStyle(dbStyle);
    workspace.views.configuration.styles.addElementStyle(queueStyle);
    workspace.views.configuration.styles.addRelationshipStyle(asyncStyle);
    workspace.views.configuration.styles.addRelationshipStyle(syncStyle);

    return workspace;
}