FROM nginx:stable-alpine@sha256:47928bf67eb62a1863cb08d9ecb52d3e704304ba614eaee17884204677702951

ARG DEPLOYMENT_VERSION=dev

COPY public/ /usr/share/nginx/html/
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

RUN sed -i "s/__DEPLOYMENT_VERSION__/${DEPLOYMENT_VERSION}/g" /usr/share/nginx/html/index.html \
    && printf '%s\n' "$DEPLOYMENT_VERSION" > /usr/share/nginx/html/version.txt \
    && find /usr/share/nginx/html -type d -exec chmod 755 {} + \
    && find /usr/share/nginx/html -type f -exec chmod 644 {} +

EXPOSE 80
