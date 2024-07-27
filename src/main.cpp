#include <SFML/Graphics.hpp>
#include <Eigen/Dense>
#include <iostream>
#include <filesystem>
#include <chrono>

float _time;

class Shaders {
    std::unordered_map<std::string, std::shared_ptr<sf::Shader>> shaders;
public:
    void load(const std::string& name, const std::string& vertexPath, const std::string& fragmentPath) {
        auto shader = std::make_shared<sf::Shader>();
        if (!shader->loadFromFile(vertexPath, fragmentPath))
        {
            std::cerr << "Failed to load shaders" << std::endl;
            return;
        }
        shaders[name] = shader;
    }

    std::shared_ptr<sf::Shader> get(const std::string& name) {
        return shaders[name];
    }

    void remove(const std::string& name) {
        shaders.erase(name);
    }

    void clear() {
        shaders.clear();
    }

    bool exists(const std::string& name) {
        return shaders.find(name) != shaders.end();
    }
};

class Textures {
    std::map<std::string, std::shared_ptr<sf::Texture>> textures;
public:
    void load(const std::string& name, const std::string& path) {
        sf::Texture texture;
        if (!texture.loadFromFile(path))
        {
            std::cerr << "Failed to load texture" << std::endl;
            return;
        }
        textures[name] = std::make_shared<sf::Texture>(texture);
    }

    std::shared_ptr<sf::Texture> get(const std::string& name) {
        return textures[name];
    }

    void remove(const std::string& name) {
        textures.erase(name);
    }

    void clear() {
        textures.clear();
    }

    bool exists(const std::string& name) {
        return textures.find(name) != textures.end();
    }
};

class MixedMeasure {
    float pixels;
    float percentage;
public:
    // pixels: integer, percentage: 0.0-1.0 (or less/more)
    MixedMeasure(float pixels, float percentage) : pixels(pixels), percentage(percentage) {}

    float getPercentage(float max_pixels) {
        return pixels/max_pixels + percentage;
    }

    float getPixels(float max_pixels) {
        return pixels + percentage * max_pixels;
    }
};

/*

class Sprite {
    std::shared_ptr<sf::Texture> texture;
    std::shared_ptr<sf::Shader> shader;
    sf::VertexArray vertices;

    float rotation = 0.;
    MixedMeasure lower_x = MixedMeasure(0, 0);
    MixedMeasure lower_y = MixedMeasure(0, 0);
    MixedMeasure upper_x = MixedMeasure(0, 1);
    MixedMeasure upper_y = MixedMeasure(0, 1);
public:
    Sprite(std::shared_ptr<sf::Texture> texture, std::shared_ptr<sf::Shader> shader) : texture(texture), shader(shader) {
        vertices.setPrimitiveType(sf::Quads);
        vertices.resize(4);
        vertices[0].position = sf::Vector2f(-0.f, -0.f);
        vertices[1].position = sf::Vector2f(+1.f, -0.f);
        vertices[2].position = sf::Vector2f(+1.f, +1.f);
        vertices[3].position = sf::Vector2f(-0.f, +1.f);
    }

    Eigen::Matrix3f getTransform(float width, float height) {
        Eigen::Isometry2f rotation = Eigen::Isometry2f::Identity();
        rotation.rotate(this->rotation);
        Eigen::Matrix3f placement = Eigen::Matrix3f::Identity();
        placement(0, 0) = upper_x.getPercentage(width) - lower_x.getPercentage(width);
        placement(1, 1) = upper_y.getPercentage(height) - lower_y.getPercentage(height);
        placement(0, 2) = lower_x.getPercentage(width);
        placement(1, 2) = lower_y.getPercentage(height);

        return placement * rotation.matrix();
    }

    void setTexture(std::shared_ptr<sf::Texture> texture) {
        this->texture = texture;
    }

    void setTransform(MixedMeasure lower_x, MixedMeasure lower_y, MixedMeasure upper_x, MixedMeasure upper_y, float rotation) {
        this->lower_x = lower_x;
        this->lower_y = lower_y;
        this->upper_x = upper_x;
        this->upper_y = upper_y;
        this->rotation = rotation;
    }

    void draw(sf::RenderTarget& target) {
        Eigen::Matrix3f transform_matrix = getTransform(target.getSize().x, target.getSize().y);

        shader->setUniform("transform", sf::Glsl::Mat3(transform_matrix.data()));
        shader->setUniform("image", *texture);
        shader->setUniform("resolution", sf::Glsl::Vec2(target.getSize().x, target.getSize().y));
        target.draw(vertices, shader.get());
    }

    void draw(sf::RenderTarget& target, float time) {
        shader->setUniform("time", time);
        draw(target);
    }
};

*/

class Filter {
    std::shared_ptr<sf::Shader> shader;
    std::shared_ptr<sf::Texture> texture;

    sf::RenderTexture render_texture;
    std::shared_ptr<sf::Texture> output;

    // vertices of a quad
    sf::VertexArray vertices;
    float rotation = 0.;
    MixedMeasure lower_x = MixedMeasure(0, 0);
    MixedMeasure lower_y = MixedMeasure(0, 0);
    MixedMeasure upper_x = MixedMeasure(0, 1);
    MixedMeasure upper_y = MixedMeasure(0, 1);

    public:
    Filter(int width, int height, std::shared_ptr<sf::Shader> shader) : shader(shader) {
        render_texture.create(width, height);
        vertices.setPrimitiveType(sf::Quads);
        vertices.resize(4);
        vertices[0].position = sf::Vector2f(-0.f, -0.f);
        vertices[1].position = sf::Vector2f(+1.f, -0.f);
        vertices[2].position = sf::Vector2f(+1.f, +1.f);
        vertices[3].position = sf::Vector2f(-0.f, +1.f);

        output = std::make_shared<sf::Texture>(render_texture.getTexture());
    }

    void setTexture(std::shared_ptr<sf::Texture> texture) {
        this->texture = texture;
    }

    void setShader(std::shared_ptr<sf::Shader> shader) {
        this->shader = shader;
    }

    void setTransform(MixedMeasure lower_x, MixedMeasure lower_y, MixedMeasure upper_x, MixedMeasure upper_y, float rotation) {
        this->lower_x = lower_x;
        this->lower_y = lower_y;
        this->upper_x = upper_x;
        this->upper_y = upper_y;
        this->rotation = rotation;
    }

    Eigen::Matrix3f getTransform(float width, float height) {
        Eigen::Isometry2f rotation = Eigen::Isometry2f::Identity();
        rotation.rotate(this->rotation);
        Eigen::Matrix3f placement = Eigen::Matrix3f::Identity();
        placement(0, 0) = upper_x.getPercentage(width) - lower_x.getPercentage(width);
        placement(1, 1) = upper_y.getPercentage(height) - lower_y.getPercentage(height);
        placement(0, 2) = lower_x.getPercentage(width);
        placement(1, 2) = lower_y.getPercentage(height);

        return placement * rotation.matrix();
    }

    const Filter* operator()(std::shared_ptr<sf::Texture> source) {
        render_texture.clear(sf::Color::Transparent);
        shader->setUniform("time", _time);
        shader->setUniform("resolution", sf::Glsl::Vec2(source->getSize().x, source->getSize().y));
        shader->setUniform("source", *source);
        shader->setUniform("image", *texture);
        shader->setUniform("transform", sf::Glsl::Mat3(getTransform(source->getSize().x, source->getSize().y).data()));
        render_texture.draw(vertices, shader.get());
        render_texture.display();
        output = std::make_shared<sf::Texture>(render_texture.getTexture());
        return this;
    }
    
    const Filter* operator()(const Filter* source_ptr) {
        std::shared_ptr<sf::Texture> source;
        if (source_ptr == nullptr) {
            source = std::make_shared<sf::Texture>(render_texture.getTexture());
        } else {
            source = source_ptr->output;
        }
        render_texture.clear(sf::Color::Transparent);
        shader->setUniform("time", _time);
        shader->setUniform("resolution", sf::Glsl::Vec2(source->getSize().x, source->getSize().y));
        shader->setUniform("source", *source);
        shader->setUniform("image", *texture);
        shader->setUniform("transform", sf::Glsl::Mat3(getTransform(source->getSize().x, source->getSize().y).data()));
        render_texture.draw(vertices, shader.get());
        render_texture.display();
        output = std::make_shared<sf::Texture>(render_texture.getTexture());
        return this;
    }

    void draw(sf::RenderTarget& target) const {
        target.draw(sf::Sprite(*output));
    }
};

int main()
{
    unsigned int width = 800;
    unsigned int height = 600;
    auto window = sf::RenderWindow{ { width, height }, "Symbios" };
    window.setFramerateLimit(144);

    // this will remember textures/shaders
    std::filesystem::path dir = std::filesystem::current_path();
    Shaders shaders;
    Textures textures;
    textures.load("noise", "assets/textures/noise.png");

    // setup ocean
    shaders.load("ocean", "assets/shaders/default.vert", "assets/shaders/ocean.frag");
    Filter ocean(width/4, height/4, shaders.get("ocean"));
    shaders.load("default", "assets/shaders/default.vert", "assets/shaders/default.frag");
    Filter upscale(width, height, shaders.get("default"));

    auto start = std::chrono::high_resolution_clock::now();
    while (window.isOpen())
    {
        for (auto event = sf::Event{}; window.pollEvent(event);)
        {
            if (event.type == sf::Event::Closed)
            {
                window.close();
            }
        }
        auto end = std::chrono::high_resolution_clock::now();
        _time = std::chrono::duration<float>(end - start).count();

        window.clear();
        upscale(ocean(nullptr))->draw(window);
        window.display();
    }
}
