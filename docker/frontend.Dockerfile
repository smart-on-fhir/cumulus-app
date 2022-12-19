FROM nginx:alpine

# Mounted as volume in docker compose
# COPY ./build /usr/share/nginx/html

COPY ./docker/nginx.conf /etc/nginx/conf.d/default.conf

CMD ["sh", "-c", "nginx -g 'daemon off;'"]